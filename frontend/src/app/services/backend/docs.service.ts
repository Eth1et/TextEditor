import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { handleError } from './user.service';
import { TypeOf, z } from 'zod';

import {
    searchDocumentsSchema,
    createDocumentSchema,
    saveDocumentSchema,
    docPriviligesSchema,
    docDetailsSchema,
    deleteDocumentSchema,
    addAccessOverride,
    removeAccessOverride,
    updateAccessOverride,
    queryAccessOverride
} from '@shared/route_schemas';

import { environment } from '../../environments/environment';
import { CreatedID, DocumentDetails, QueriedDocument, QueriedOverride } from '@shared/response_models';

export type searchDto = z.infer<typeof searchDocumentsSchema>;
export type createDto = z.infer<typeof createDocumentSchema>;
export type saveDto = z.infer<typeof saveDocumentSchema>;
export type updateDto = z.infer<typeof docPriviligesSchema>;
export type detailsDto = z.infer<typeof docDetailsSchema>;
export type deleteDto = z.infer<typeof deleteDocumentSchema>;
export type addOverrideDto = z.infer<typeof addAccessOverride>;
export type removeOverrideDto = z.infer<typeof removeAccessOverride>;
export type updateOverrideDto = z.infer<typeof updateAccessOverride>;
export type queryOverridesDto = z.infer<typeof queryAccessOverride>;

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

    async details(dto: detailsDto): Promise<DocumentDetails> {
        docDetailsSchema.parse(dto);

        return await firstValueFrom(
            this.http.post<DocumentDetails>(
                `${this.API}/document-details`,
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
                { withCredentials: true, responseType: 'text' }
            )
        ).catch(err => Promise.reject(handleError(err)));
    }

    async save(dto: saveDto): Promise<string> {
        saveDocumentSchema.parse(dto);

        return await firstValueFrom(
            this.http.patch(
                `${this.API}/save-document`,
                dto,
                { withCredentials: true, responseType: 'text' }
            )
        ).catch(err => Promise.reject(handleError(err)));
    }

    async update(dto: updateDto): Promise<string> {
        docPriviligesSchema.parse(dto);

        return await firstValueFrom(
            this.http.patch(
                `${this.API}/update-document`,
                dto,
                { withCredentials: true, responseType: 'text' }
            )
        ).catch(err => Promise.reject(handleError(err)));
    }

    async delete(dto: deleteDto): Promise<string> {
        deleteDocumentSchema.parse(dto);
        return await firstValueFrom(
            this.http.request(
                'delete',
                `${this.API}/delete-document`,
                { body: dto, withCredentials: true, responseType: 'text' }
            )
        ).catch(err => Promise.reject(handleError(err)));
    }
    //query-access-overrides
    async addOverride(dto: addOverrideDto): Promise<string> {
        addAccessOverride.parse(dto);

        return await firstValueFrom(
            this.http.post(
                `${this.API}/add-access-override`,
                dto,
                { withCredentials: true, responseType: 'text' }
            )
        ).catch(err => Promise.reject(handleError(err)));
    }

    async updateOverride(dto: updateOverrideDto): Promise<string> {
        updateAccessOverride.parse(dto);

        return await firstValueFrom(
            this.http.patch(
                `${this.API}/update-access-override`,
                dto,
                { withCredentials: true, responseType: 'text' }
            )
        ).catch(err => Promise.reject(handleError(err)));
    }

    async removeOverride(dto: removeOverrideDto): Promise<string> {
        removeAccessOverride.parse(dto);

        return await firstValueFrom(
            this.http.request(
                'delete',
                `${this.API}/remove-access-override`,
                { body: dto, withCredentials: true, responseType: 'text' }
            )
        ).catch(err => Promise.reject(handleError(err)));
    }

    async queryOverrides(dto: queryOverridesDto): Promise<Array<QueriedOverride>> {
        queryAccessOverride.parse(dto);

        return await firstValueFrom(
            this.http.post<Array<QueriedOverride>>(
                `${this.API}/query-access-overrides`,
                dto,
                { withCredentials: true }
            )
        ).catch(err => Promise.reject(handleError(err)));
    }
}