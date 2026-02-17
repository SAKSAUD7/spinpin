'use client';

import React from 'react';
import Link from 'next/link';
import { Plus } from 'lucide-react';
import { CollectionList } from '../CollectionList';
import { schemas } from '@/lib/cms/schema';
import { deleteGuidelineCategory } from '@/app/actions/guideline-categories';

interface GuidelinesManagerProps {
    items: any[];
}

export function GuidelinesManager({ items }: GuidelinesManagerProps) {
    return (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                <div>
                    <h2 className="text-lg font-semibold text-slate-900">Safety Guidelines</h2>
                    <p className="text-sm text-slate-500">Manage safety rules and guideline categories</p>
                </div>
                <Link
                    href="/admin/cms/guideline-categories/new"
                    className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors text-sm font-medium"
                >
                    <Plus className="w-4 h-4" />
                    Add Category
                </Link>
            </div>

            <div className="p-6">
                <CollectionList
                    schema={schemas.guideline_category}
                    items={items}
                    onDelete={deleteGuidelineCategory}
                    basePath="/admin/cms/guideline-categories"
                    titleField="title"
                    subtitleField="icon"
                    showBackButton={false}
                />
            </div>
        </div>
    );
}
