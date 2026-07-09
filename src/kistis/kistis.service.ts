import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { GenerateKistiDto } from "./dto/generate-kisti.dto";
import { UpdateDepositDto } from "./dto/update-deposit.dto";

@Injectable()
export class KistisService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Converts a date string into the beginning and end of its month.
   *
   * Example:
   * selectedDate = 2026-06-16
   * monthStart   = 2026-06-01
   * nextMonth    = 2026-07-01
   */
  private getMonthRange(dateValue: string | Date) {
    const date = new Date(dateValue);

    if (Number.isNaN(date.getTime())) {
      throw new BadRequestException("Invalid date");
    }

    const monthStart = new Date(
      Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), 1),
    );

    const nextMonthStart = new Date(
      Date.UTC(date.getUTCFullYear(), date.getUTCMonth() + 1, 1),
    );

    const previousMonthStart = new Date(
      Date.UTC(date.getUTCFullYear(), date.getUTCMonth() - 1, 1),
    );

    return {
      selectedDate: date,
      monthStart,
      nextMonthStart,
      previousMonthStart,
    };
  }

  /**
   * Finds the Amount record belonging to the selected month.
   *
   * This assumes that one Amount record is created for each month.
   */
  private async findMonthlyAmount(date: string | Date) {
    const { monthStart, nextMonthStart } = this.getMonthRange(date);

    const amount = await this.prisma.amount.findFirst({
      where: {
        date: {
          gte: monthStart,
          lt: nextMonthStart,
        },
      },
      orderBy: {
        date: "desc",
      },
    });

    if (!amount) {
      throw new NotFoundException(
        "No installment amount was found for the selected month",
      );
    }

    if (amount.amount === null) {
      throw new BadRequestException(
        "The selected Amount record does not contain an amount",
      );
    }

    return amount;
  }

  /**
   * Displays every user with calculated installment information.
   * This method does not save anything.
   */
  async preview(date: string) {
    const { selectedDate, previousMonthStart, monthStart } =
      this.getMonthRange(date);

    const [users, monthlyAmount] = await Promise.all([
      this.prisma.user.findMany({
        orderBy: {
          id: "asc",
        },
      }),
      this.findMonthlyAmount(date),
    ]);

    if (users.length === 0) {
      return {
        date: selectedDate,
        amountId: monthlyAmount.id,
        installmentAmount: monthlyAmount.amount,
        totalUsers: 0,
        users: [],
      };
    }

    /*
     * Find all records from the previous calendar month.
     *
     * For June 2026, this searches:
     * >= May 1, 2026
     * <  June 1, 2026
     */
    const previousMonthRecords = await this.prisma.kisti.findMany({
      where: {
        userId: {
          in: users.map((user) => user.id),
        },
        date: {
          gte: previousMonthStart,
          lt: monthStart,
        },
      },
      orderBy: {
        date: "desc",
      },
    });

    /*
     * Keep one previous-month record per user.
     * Because records are ordered newest first, the first record is used.
     */
    const previousDueByUser = new Map<number, number>();

    for (const record of previousMonthRecords) {
      if (!previousDueByUser.has(record.userId)) {
        previousDueByUser.set(record.userId, record.currentDue ?? 0);
      }
    }

    const installment = monthlyAmount.amount ?? 0;

    const calculatedUsers = users.map((user) => {
      const previousDue = previousDueByUser.get(user.id) ?? 0;

      // Because the schema uses Int, the 10% fine is rounded.
      const fine = Math.round(previousDue * 0.1);

      const currentInstallment = installment;
      const total = previousDue + fine + currentInstallment;
      const deposit = 0;
      const currentDue = total - deposit;

      return {
        userId: user.id,
        name: user.name,
        date: selectedDate,
        previousDue,
        fine,
        currentInstallment,
        total,
        deposit,
        currentDue,
      };
    });

    return {
      date: selectedDate,
      amountId: monthlyAmount.id,
      installmentAmount: monthlyAmount.amount,
      totalUsers: calculatedUsers.length,
      users: calculatedUsers,
    };
  }

  /**
   * Creates the monthly Kisti record for every user.
   */
  async generate(generateKistiDto: GenerateKistiDto) {
    const { selectedDate, monthStart, nextMonthStart } = this.getMonthRange(
      generateKistiDto.date,
    );

    const preview = await this.preview(generateKistiDto.date);

    if (preview.totalUsers === 0) {
      throw new BadRequestException("No users were found");
    }

    /*
     * Prevent generating the same month's records twice.
     */
    const existingCount = await this.prisma.kisti.count({
      where: {
        date: {
          gte: monthStart,
          lt: nextMonthStart,
        },
      },
    });

    if (existingCount > 0) {
      throw new ConflictException(
        "Kisti records have already been generated for this month",
      );
    }

    const records = preview.users.map((item) => ({
      userId: item.userId,
      amountId: preview.amountId,
      date: selectedDate,
      totalDue: item.previousDue,
      jorimana: item.fine,
      currentKisti: item.currentInstallment,
      total: item.total,
      joma: item.deposit,
      currentDue: item.currentDue,
    }));

    /*
     * All records are inserted in one database transaction.
     */
    await this.prisma.$transaction(async (transaction) => {
      await transaction.kisti.createMany({
        data: records,
      });
    });

    return {
      message: "Kisti records generated successfully",
      date: selectedDate,
      amountId: preview.amountId,
      totalCreated: records.length,
      records,
    };
  }

  async findAll(startMonth?: string, endMonth?: string) {
    const dateFilter: {
      gte?: Date;
      lt?: Date;
    } = {};

    // Beginning of the starting month
    if (startMonth) {
      const { year, month } = this.parseMonth(startMonth, "startMonth");

      dateFilter.gte = new Date(Date.UTC(year, month - 1, 1));
    }

    // Beginning of the month after the ending month
    if (endMonth) {
      const { year, month } = this.parseMonth(endMonth, "endMonth");

      dateFilter.lt = new Date(Date.UTC(year, month, 1));
    }

    // Prevent an invalid range
    if (dateFilter.gte && dateFilter.lt && dateFilter.gte >= dateFilter.lt) {
      throw new BadRequestException(
        "startMonth must be before or equal to endMonth",
      );
    }

    return this.prisma.kisti.findMany({
      where: {
        ...(Object.keys(dateFilter).length > 0 && {
          date: dateFilter,
        }),
      },

      include: {
        user: {
          select: {
            id: true,
            name: true,
            role: true,
          },
        },
        amount: true,
      },

      orderBy: [
        {
          date: "desc",
        },
        {
          userId: "asc",
        },
      ],
    });
  }

  private parseMonth(
    value: string,
    fieldName: string,
  ): { year: number; month: number } {
    const match = /^(\d{4})-(0[1-9]|1[0-2])$/.exec(value);

    if (!match) {
      throw new BadRequestException(
        `${fieldName} must use YYYY-MM format, for example 2026-06`,
      );
    }

    return {
      year: Number(match[1]),
      month: Number(match[2]),
    };
  }

  async findByDate(date: string) {
    const { monthStart, nextMonthStart } = this.getMonthRange(date);

    const records = await this.prisma.kisti.findMany({
      where: {
        date: {
          gte: monthStart,
          lt: nextMonthStart,
        },
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            role: true,
          },
        },
        amount: true,
      },
      orderBy: {
        userId: "asc",
      },
    });

    return {
      date,
      totalRecords: records.length,
      records: records.map((record) => ({
        id: record.id,
        userId: record.userId,
        name: record.user.name,
        date: record.date,
        previousDue: record.totalDue,
        fine: record.jorimana,
        currentInstallment: record.currentKisti,
        total: record.total,
        deposit: record.joma,
        currentDue: record.currentDue,
        amountId: record.amountId,
      })),
    };
  }

  async findOne(id: number) {
    const record = await this.prisma.kisti.findUnique({
      where: { id },
      include: {
        user: true,
        amount: true,
      },
    });

    if (!record) {
      throw new NotFoundException(`Kisti record with ID ${id} was not found`);
    }

    return {
      id: record.id,
      userId: record.userId,
      name: record.user.name,
      date: record.date,
      previousDue: record.totalDue,
      fine: record.jorimana,
      currentInstallment: record.currentKisti,
      total: record.total,
      deposit: record.joma,
      currentDue: record.currentDue,
      amountId: record.amountId,
    };
  }

  /**
   * Updates Deposit and recalculates Current Due.
   *
   * Current Due = Total - Deposit
   */
  async updateDeposit(id: number, updateDepositDto: UpdateDepositDto) {
    const record = await this.prisma.kisti.findUnique({
      where: { id },
    });

    if (!record) {
      throw new NotFoundException(`Kisti record with ID ${id} was not found`);
    }

    const deposit: number = updateDepositDto.joma;
    const total: number = record.total ?? 0;

    if (deposit > total) {
      throw new BadRequestException(
        "Deposit cannot be greater than the total payable amount",
      );
    }

    const currentDue: number = total - deposit;

    const updatedRecord = await this.prisma.kisti.update({
      where: { id },
      data: {
        joma: deposit,
        currentDue,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
          },
        },
        amount: true,
      },
    });

    return {
      message: "Deposit updated successfully",
      id: updatedRecord.id,
      userId: updatedRecord.userId,
      name: updatedRecord.user.name,
      total: updatedRecord.total,
      deposit: updatedRecord.joma,
      currentDue: updatedRecord.currentDue,
    };
  }

  async removeByMonth(month: string) {
    const [year, monthNumber] = month.split("-").map(Number);

    const startDate = new Date(Date.UTC(year, monthNumber - 1, 1, 0, 0, 0, 0));

    const endDate = new Date(Date.UTC(year, monthNumber, 1, 0, 0, 0, 0));

    const existingRecords = await this.prisma.kisti.count({
      where: {
        date: {
          gte: startDate,
          lt: endDate,
        },
      },
    });

    if (existingRecords === 0) {
      throw new NotFoundException(`No Kisti records found for ${month}.`);
    }

    const result = await this.prisma.kisti.deleteMany({
      where: {
        date: {
          gte: startDate,
          lt: endDate,
        },
      },
    });

    return {
      success: true,
      message: `${result.count} Kisti records deleted for ${month}.`,
      deletedCount: result.count,
      month,
    };
  }
}
