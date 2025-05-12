import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { handleError } from './user.service';
import { z } from 'zod';

import {
    searchDocumentsSchema,
    createDocumentSchema,
    saveDocumentSchema
} from '@shared/route_schemas';

import { environment } from '../../environments/environment';
import { CreatedID, QueriedDocument } from '@shared/response_models';

export type searchDto = z.infer<typeof searchDocumentsSchema>;
export type createDto = z.infer<typeof createDocumentSchema>;
export type saveDto = z.infer<typeof saveDocumentSchema>;

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

    async create(dto: createDto): Promise<CreatedID> {
        createDocumentSchema.parse(dto);

        return await firstValueFrom(
            this.http.post(
                `${this.API}/create-document`,
                dto,
                { withCredentials: true, responseType: 'text'}
            )
        ).catch(err => Promise.reject(handleError(err)));
    }

    async save(dto: saveDto): Promise<string> {
        saveDocumentSchema.parse(dto);

        return await firstValueFrom(
            this.http.post(
                `${this.API}/save-document`,
                dto,
                { withCredentials: true, responseType: 'text'}
            )
        ).catch(err => Promise.reject(handleError(err)));
    }

}