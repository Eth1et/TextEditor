import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { handleError } from './user.service';
import { z } from 'zod';

import {
    searchDocumentsSchema
} from '@shared/route_schemas';

import { environment } from '../../environments/environment';
import { QueriedDocument } from '@shared/response_models';

export type searchDto = z.infer<typeof searchDocumentsSchema>;

@Injectable({
    providedIn: 'root',
})
export class DocumentsService {
    private readonly API = environment.SERVER_URL;

    constructor(private http: HttpClient) { }

    async query(dto: searchDto): Promise<Array<QueriedDocument>> {
        searchDocumentsSchema.parse(dto);

        return await firstValueFrom(
            this.http.post<Array<QueriedDocument>>(
                `${this.API}/query-documents`,
                dto,
                { withCredentials: true }
            )
        ).catch(err => Promise.reject(handleError(err)));
    }

}