import QueryBuilder from "../../builder/QueryBuilder";
import AppError from "../../errors/AppError";
import { httpStatus } from "../../utils/httpStatus";
import prisma from "../../utils/prisma";


const createpreorder = async (data: any) => {

//if you wanna add logic here
    const result = await prisma.preorder.create({ data });
    return result;
};

const getAllpreorders = async (query: Record<string, any>) => {
  // ১. Express কুয়েরি থেকে স্ট্রিং হিসেবে আসা "true"/"false" কে বুুলিয়ানে রূপান্তর করা
  const processedQuery = { ...query };
  if (processedQuery.status === "true") processedQuery.status = true;
  if (processedQuery.status === "false") processedQuery.status = false;

  // ২. আপনার ক্যোয়ারী বিল্ডার চেইনিং
  const preOrderData = new QueryBuilder(prisma.preorder, processedQuery)
    .filter()    // Active, Inactive ফিল্টারের জন্য
    .sort()      // Newest/Oldest/Products সর্টিং এর জন্য
    .paginate(); // পেজিনেশনের জন্য

  // ৩. এক্সিকিউশন ও মেটাডাটা (টোটাল কাউন্ট) রিটার্ন
  const result = await preOrderData.execute();
  const meta = await preOrderData.countTotal();

  return {
    meta, // এর ভেতর page, limit, total, totalPage থাকবে যা ফ্রন্টএন্ড পেজিনেশনে লাগবে
    result,
  };
};

const getSinglepreorder = async (id: string) => {
    const result = await prisma.preorder.findUnique({ where: { id } });
    if(!result){
     throw new AppError(httpStatus.NOT_FOUND, "preorder not found..!!")
    }
    return result;
};

const updatepreorder = async (id: string, data: any) => {
    const existingpreorder = await prisma.preorder.findUnique({ where: { id } });
    if (!existingpreorder) {
        throw new AppError(httpStatus.NOT_FOUND, "preorder not found..!!");
    }
    const result = await prisma.preorder.update({ where: { id }, data });
    return result;
};

const deletepreorder = async (id: string) => {
 const existingpreorder = await prisma.preorder.findUnique({ where: { id } });
    if (!existingpreorder) {
        throw new AppError(httpStatus.NOT_FOUND, "preorder not found..!!");
    }
    const result = await prisma.preorder.delete({ where: { id } });
    return null;
};

export const preorderService = {
    createpreorder,
    getAllpreorders,
    getSinglepreorder,
    updatepreorder,
    deletepreorder,
};
