import { makeStateKey } from "@angular/core";
import { IGetOneUserResponse } from "app/features/auth/models/auth.model";

export const USER_KEY = makeStateKey<IGetOneUserResponse>('userData');
