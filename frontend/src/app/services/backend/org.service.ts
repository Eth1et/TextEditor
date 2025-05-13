import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { handleError } from './user.service';
import { z } from 'zod';

import {
    createOrgSchema,
    orgDetailsSchema
} from '@shared/route_schemas';

import { environment } from '../../environments/environment';
import { CreatedID, OrgDetails, QueriedOrg } from '@shared/response_models';

export type createDto = z.infer<typeof createOrgSchema>;
export type detailsDto = z.infer<typeof orgDetailsSchema>;

@Injectable({
    providedIn: 'root',
})
export class OrgService {
    private readonly API = environment.SERVER_URL;

    constructor(private http: HttpClient) { }

    async query(): Promise<Array<QueriedOrg>> {
        return await firstValueFrom(
            this.http.post<Array<QueriedOrg>>(
                `${this.API}/query-orgs`,
                {},
                { withCredentials: true }
            )
        ).catch(err => Promise.reject(handleError(err)));
    }

    async create(dto: createDto): Promise<CreatedID> {
        createOrgSchema.parse(dto);

        return await firstValueFrom(
            this.http.post(
                `${this.API}/create-org`,
                dto,
                { withCredentials: true, responseType: 'text' }
            )
        ).catch(err => Promise.reject(handleError(err)));
    }

    async details(dto: detailsDto): Promise<OrgDetails> {
        return await firstValueFrom(
            this.http.post<OrgDetails>(
                `${this.API}/org-details`,
                dto,
                { withCredentials: true }
            )
        ).catch(err => Promise.reject(handleError(err)));
    }
}