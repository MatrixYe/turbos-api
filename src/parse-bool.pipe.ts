import { ArgumentMetadata, BadRequestException, Injectable, PipeTransform } from "@nestjs/common";

@Injectable()
export class ParseBoolPipe implements PipeTransform<string, boolean> {
  transform(value: string, metadata: ArgumentMetadata): boolean {
    if (value == null) {
      throw new BadRequestException("The boolean value is missing");
    }

    if (value.toLowerCase() === "true") {
      return true;
    } else if (value.toLowerCase() === "false") {
      return false;
    } else {
      throw new BadRequestException(`Validation failed for the boolean field. The value '${value}' is not a valid boolean value.`);
    }
  }
}
