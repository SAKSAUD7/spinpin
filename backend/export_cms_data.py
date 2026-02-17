"""
Selective CMS Data Export Script
Exports ALL CMS content + sample booking data
"""
import os
import sys
import django
import json

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'ninja_backend.settings')
django.setup()

from apps.cms.models import (
    Activity, Banner, InstagramReel, Page, Faq, Testimonial, 
    SocialLink, GalleryItem, StatCard, MenuSection
)
from apps.bookings.models import Customer, SessionBooking, PartyBooking, BookingBlock, Transaction, Waiver
from django.core.serializers import serialize

def export_model(model, limit=None, name=None):
    """Export a model to JSON with optional limit"""
    model_name = name or model.__name__
    queryset = model.objects.all()
    
    if limit:
        queryset = queryset[:limit]
        print(f"📦 Exporting {queryset.count()} sample {model_name} records...")
    else:
        print(f"📦 Exporting ALL {queryset.count()} {model_name} records...")
    
    # Serialize to Python objects first
    data = serialize('python', queryset, use_natural_foreign_keys=True, use_natural_primary_keys=True)
    return data

def main():
    export_data = []
    
    print("\n🎨 EXPORTING CMS CONTENT (ALL)")
    print("=" * 50)
    
    # Export ALL CMS content
    export_data.extend(export_model(Page))
    export_data.extend(export_model(Activity))
    export_data.extend(export_model(Banner))
    export_data.extend(export_model(InstagramReel))
    export_data.extend(export_model(Faq))
    export_data.extend(export_model(Testimonial))
    export_data.extend(export_model(SocialLink))
    export_data.extend(export_model(GalleryItem))
    export_data.extend(export_model(StatCard))
    export_data.extend(export_model(MenuSection))
    
    print("\n📋 EXPORTING SAMPLE BOOKING DATA (1-2 records each)")
    print("=" * 50)
    
    # Export sample booking data (1-2 records each)
    export_data.extend(export_model(Customer, limit=2))
    export_data.extend(export_model(SessionBooking, limit=2))
    export_data.extend(export_model(PartyBooking, limit=2))
    export_data.extend(export_model(BookingBlock, limit=2))
    export_data.extend(export_model(Transaction, limit=2))
    export_data.extend(export_model(Waiver, limit=2))
    
    # Write to file with UTF-8 encoding
    output_file = 'cms_migration_data.json'
    print(f"\n💾 Writing to {output_file}...")
    
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(export_data, f, ensure_ascii=False, indent=2)
    
    print(f"\n✅ Export complete!")
    print(f"📁 File: {output_file}")
    print(f"📊 Total records: {len(export_data)}")
    print(f"\n🖼️  Note: All images are already on Azure Blob Storage!")
    print(f"   They will automatically work once you load this data.\n")

if __name__ == '__main__':
    main()
