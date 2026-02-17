'use server';

import { revalidatePath } from 'next/cache';
import { fetchAPI, postAPI, putAPI, deleteAPI, API_ENDPOINTS } from '@/lib/api';

const ENDPOINT = API_ENDPOINTS.cms.faqs;

export async function getFaqs(): Promise<any[]> {
    try {
        const data = await fetchAPI(ENDPOINT, { cache: 'no-store' });
        return Array.isArray(data) ? data : [];
    } catch (error) {
        return [];
    }
}

export async function getFaq(id: string): Promise<any> {
    try {
        const data = await fetchAPI(`${ENDPOINT}${id}/`, { cache: 'no-store' });
        return data;
    } catch (error) {
        return null;
    }
}

export async function createFaq(data: any): Promise<void> {
    await postAPI(ENDPOINT, data);
    revalidatePath('/admin/faqs');
}

export async function updateFaq(id: string, data: any): Promise<void> {
    await putAPI(`${ENDPOINT}${id}/`, data);
    revalidatePath('/admin/faqs');
}

export async function deleteFaq(id: string): Promise<void> {
    await deleteAPI(`${ENDPOINT}${id}/`);
    revalidatePath('/admin/faqs');
}
