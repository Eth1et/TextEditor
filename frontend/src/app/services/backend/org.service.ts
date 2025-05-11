import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { handleError } from './user.service';
// import { z } from 'zod';

// import {
//     searchDocumentsSchema
// } from '@shared/route_schemas';

import { environment } from '../../environments/environment';
import { QueriedOrg } from '@shared/response_models';

//export type searchDto = z.infer<typeof searchDocumentsSchema>;

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
                { withCredentials: true }
            )
        ).catch(err => Promise.reject(handleError(err)));
    }

}