"""
Complete CMS Data Export - ALL Models
Exports every CMS model from the database
"""
import os
import sys
import django
import json

# Force UTF-8 encoding
if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'ninja_backend.settings')
django.setup()

def export_all_cms_data():
    """Export ALL CMS data to JSON"""
    from apps.cms import models as cms_models
    
    data = {}
    
    # Complete list of ALL CMS models
    cms_model_names = [
        # Pages & Content
        'Page', 'PageSection', 'Activity', 'Banner', 
        
        # Contact & Info
        'ContactInfo', 'ContactInformation',
        
        # Social & Media
        'InstagramReel', 'SocialLink', 'GalleryItem',
        
        # Pricing & Packages
        'PricingPlan', 'PartyPackage', 'GroupPackage',
        
        # Facilities & Features
        'FacilityItem', 'ValueItem', 'TimelineItem',
        
        # Content Sections
        'Faq', 'Testimonial', 'StatCard', 'MenuSection',
        
        # Legal & Guidelines
        'LegalDocument', 'GuidelineCategory',
    ]
    
    print("\n🎨 Exporting ALL CMS Data...")
    print("=" * 60)
    
    for model_name in cms_model_names:
        try:
            model_class = getattr(cms_models, model_name)
            records = list(model_class.objects.values())
            if records:  # Only include if there's data
                data[model_name] = records
                print(f"✅ {model_name}: {len(records)} records")
            else:
                print(f"⚪ {model_name}: 0 records (skipped)")
        except AttributeError:
            print(f"⚠️  {model_name}: Model not found, skipping")
        except Exception as e:
            print(f"❌ {model_name}: Error - {str(e)}")
    
    # Write to file
    output_file = 'complete_cms_export.json'
    print(f"\n💾 Writing to {output_file}...")
    
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=2, default=str)
    
    print(f"✅ Export complete! File: {output_file}\n")
    
    # Print summary
    total_records = sum(len(records) for records in data.values())
    print(f"📊 Total records exported: {total_records}")
    print(f"📦 Models with data: {len(data)}")
    print(f"\n🖼️  Note: Images are already on Azure Blob Storage!\n")

if __name__ == '__main__':
    export_all_cms_data()
