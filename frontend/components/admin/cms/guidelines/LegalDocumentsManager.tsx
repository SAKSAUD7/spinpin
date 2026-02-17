'use client';

import React from 'react';
import Link from 'next/link';
import { Plus } from 'lucide-react';
import { CollectionList } from '../CollectionList';
import { schemas } from '@/lib/cms/schema';
import { deleteLegalDocument } from '@/app/actions/legal-documents';

interface LegalDocumentsManagerProps {
    items: any[];
}

export function LegalDocumentsManager({ items }: LegalDocumentsManagerProps) {
    return (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                <div>
                    <h2 className="text-lg font-semibold text-slate-900">Legal Documents</h2>
                    <p className="text-sm text-slate-500">Manage terms, conditions, waivers, and policies</p>
                </div>
                <Link
                    href="/admin/cms/legal-documents/new"
                    className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors text-sm font-medium"
                >
                    <Plus className="w-4 h-4" />
                    Add Document
                </Link>
            </div>

            <div className="p-6">
                <CollectionList
                    schema={schemas.legal_document}
                    items={items}
                    onDelete={deleteLegalDocument}
                    basePath="/admin/cms/legal-documents"
                    titleField="title"
                    subtitleField="document_type"
                    showBackButton={false}
                />
            </div>
        </div>
    );
}
