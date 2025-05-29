import { CreateTrainingDto } from './create-training.dto';
declare const UpdateTrainingDto_base: import("@nestjs/mapped-types").MappedType<Partial<CreateTrainingDto>>;
export declare class UpdateTrainingDto extends UpdateTrainingDto_base {
    modality: string;
    hour: string;
    adress: string;
    weekday: string;
    description: string;
    atictive: boolean;
    maxStudents: number;
    minStudents: number;
}
export {};
