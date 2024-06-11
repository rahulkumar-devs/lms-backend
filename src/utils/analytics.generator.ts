import { Document, Model } from "mongoose";

interface MonthData {
  month: string;
  count: number;
}

export async function generateLast12MonthData<T extends Document>(
  model: Model<T>
): Promise<{ last12Months: MonthData[] }> {
  const last12Months: MonthData[] = [];
  const currentDate = new Date();

  for (let i = 11; i >= 0; i--) {
    const startDate = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
    const endDate = new Date(currentDate.getFullYear(), currentDate.getMonth() - i + 1, 0);

    const monthYear = `${startDate.toLocaleDateString("default", {
      month: "short",
    })} ${startDate.getDate()} - ${endDate.toLocaleDateString("default", {
      month: "short",
    })} ${endDate.getDate()}, ${endDate.getFullYear()}`;

    try {
      const count = await model.countDocuments({
        createdAt: {
          $gte: startDate,
          $lte: endDate,
        },
      });

      last12Months.push({ month: monthYear, count });
    } catch (error:any) {
      console.error(`Error fetching data for ${monthYear}: ${error.message}`);
      last12Months.push({ month: monthYear, count: 0 });
    }
  }

  return { last12Months };
}
