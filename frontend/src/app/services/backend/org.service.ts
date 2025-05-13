import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { handleError } from './user.service';
import { z } from 'zod';

import {
    createOrgSchema,
    orgDetailsSchema,
    updateOrgSchema,
    deleteOrgSchema,
    addMemberSchema,
    removeMemberSchema,
    updateMemberSchema,
    queryMembersSchema
} from '@shared/route_schemas';

import { environment } from '../../environments/environment';
import { CreatedID, OrgDetails, QueriedMember, QueriedOrg } from '@shared/response_models';

export type createDto = z.infer<typeof createOrgSchema>;
export type detailsDto = z.infer<typeof orgDetailsSchema>;
export type updateDto = z.infer<typeof updateOrgSchema>;
export type deleteDto = z.infer<typeof deleteOrgSchema>;
export type addMemberDto = z.infer<typeof addMemberSchema>;
export type removeMemberDto = z.infer<typeof removeMemberSchema>;
export type updateMemberDto = z.infer<typeof updateMemberSchema>;
export type queryMembersDto = z.infer<typeof queryMembersSchema>;

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

    async update(dto: updateDto): Promise<string> {
        updateOrgSchema.parse(dto);
        return await firstValueFrom(
            this.http.patch(
                `${this.API}/update-org`,
                dto,
                { withCredentials: true, responseType: 'text' }
            )
        ).catch(err => Promise.reject(handleError(err)));
    }

    async delete(dto: deleteDto): Promise<string> {
        deleteOrgSchema.parse(dto);
        return await firstValueFrom(
            this.http.request(
                'delete',
                `${this.API}/delete-org`,
                { body: dto, withCredentials: true, responseType: 'text' }
            )
        ).catch(err => Promise.reject(handleError(err)));
    }

    async addMember(dto: addMemberDto): Promise<string> {
        addMemberSchema.parse(dto);
        return await firstValueFrom(
            this.http.post(
                `${this.API}/add-member`,
                dto,
                { withCredentials: true, responseType: 'text' }
            )
        ).catch(err => Promise.reject(handleError(err)));
    }

    async updateMember(dto: updateMemberDto): Promise<string> {
        updateMemberSchema.parse(dto);
        return await firstValueFrom(
            this.http.patch(
                `${this.API}/update-member`,
                dto,
                { withCredentials: true, responseType: 'text' }
            )
        ).catch(err => Promise.reject(handleError(err)));
    }

    async removeMember(dto: removeMemberDto): Promise<string> {
        removeMemberSchema.parse(dto);
        return await firstValueFrom(
            this.http.request(
                'delete',
                `${this.API}/delete-member`,
                { body: dto, withCredentials: true, responseType: 'text' }
            )
        ).catch(err => Promise.reject(handleError(err)));
    }

    async queryMembers(dto: queryMembersDto): Promise<Array<QueriedMember>> {
        queryMembersSchema.parse(dto);

        return await firstValueFrom(
            this.http.post<Array<QueriedMember>>(
                `${this.API}/query-members`,
                dto,
                { withCredentials: true }
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