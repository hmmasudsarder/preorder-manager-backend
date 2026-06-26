import AppError from "../../errors/AppError";
import { httpStatus } from "../../utils/httpStatus";
import prisma from "../../utils/prisma";


const createpreorder = async (data: any) => {

//if you wanna add logic here
    const result = await prisma.preorder.create({ data });
    return result;
};

const getAllpreorders = async (query: Record<string, any>) => {
    const result = await prisma.preorder.findMany();
    return result;
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
