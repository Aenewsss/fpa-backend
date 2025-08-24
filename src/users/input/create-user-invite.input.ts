import { UserRoleEnum } from "src/common/enums/role.enum";

export interface CreateUserInput {
    firstName: string
    lastName: string
    email: string;
    password: string;
    role: UserRoleEnum;
    jobRole?: string
    mustChangePassword: boolean
}