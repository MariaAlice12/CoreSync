import { PartialType } from '@nestjs/swagger';
import { CreateStravaDto } from './create-strava.dto';

export class UpdateStravaDto extends PartialType(CreateStravaDto) {}
