import { IsString, IsEmail, IsNotEmpty } from 'class-validator';

export class UpdateBusinessSettingsDto {
    @IsString()
    @IsNotEmpty()
    businessName: string;

    @IsEmail()
    @IsNotEmpty()
    businessEmail: string;

    @IsString()
    @IsNotEmpty()
    address: string;
}
