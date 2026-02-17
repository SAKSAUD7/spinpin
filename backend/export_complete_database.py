"""
Complete Database Export - ALL Apps and Models
Exports everything from local database for production migration
"""
import os
import sys
import django
import json

if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'ninja_backend.settings')
django.setup()

def export_all_data():
    """Export ALL data from ALL apps"""
    
    # Import all models
    from apps.cms import models as cms_models
    from apps.bookings import models as booking_models
    from apps.invitations import models as invitation_models
    from apps.core import models as core_models
    from apps.shop import models as shop_models
    
    data = {}
    
    # CMS Models (ALL)
    print("\n🎨 CMS Models:")
    print("=" * 70)
    cms_model_names = [
        'Page', 'PageSection', 'Activity', 'Banner', 'ContactInfo',
        'InstagramReel', 'SocialLink', 'GalleryItem', 'PricingPlan',
        'PartyPackage', 'GroupPackage', 'FacilityItem', 'ValueItem',
        'TimelineItem', 'Faq', 'Testimonial', 'StatCard', 'MenuSection',
        'LegalDocument', 'GuidelineCategory', 'ContactMessage', 'FreeEntry',
        'SessionBookingConfig', 'PartyBookingConfig'
    ]
    
    for model_name in cms_model_names:
        try:
            model_class = getattr(cms_models, model_name)
            records = list(model_class.objects.values())
            if records:
                data[f'cms.{model_name}'] = records
                print(f"✅ {model_name}: {len(records)} records")
        except AttributeError:
            pass
        except Exception as e:
            print(f"⚠️  {model_name}: {str(e)[:80]}")
    
    # Booking Models (Sample data - 2 records each)
    print("\n📅 Booking Models (Sample):")
    print("=" * 70)
    booking_model_configs = [
        ('Customer', 2),
        ('BookingBlock', 2),
        ('Booking', 2),
        ('SessionBooking', 2),
        ('PartyBooking', 2),
        ('Transaction', 2),
        ('Waiver', 2),
        ('SessionBookingHistory', 2),
        ('PartyBookingHistory', 2),
    ]
    
    for model_name, limit in booking_model_configs:
        try:
            model_class = getattr(booking_models, model_name)
            records = list(model_class.objects.values()[:limit])
            if records:
                data[f'bookings.{model_name}'] = records
                print(f"✅ {model_name}: {len(records)} sample records")
        except AttributeError:
            pass
        except Exception as e:
            print(f"⚠️  {model_name}: {str(e)[:80]}")
    
    # Invitation Models (ALL)
    print("\n🎫 Invitation Models:")
    print("=" * 70)
    invitation_model_names = ['InvitationTemplate', 'BookingInvitation']
    
    for model_name in invitation_model_names:
        try:
            model_class = getattr(invitation_models, model_name)
            records = list(model_class.objects.values())
            if records:
                data[f'invitations.{model_name}'] = records
                print(f"✅ {model_name}: {len(records)} records")
        except AttributeError:
            pass
        except Exception as e:
            print(f"⚠️  {model_name}: {str(e)[:80]}")
    
    # Core Models (Settings only, not Users)
    print("\n⚙️  Core Models:")
    print("=" * 70)
    try:
        GlobalSettings = getattr(core_models, 'GlobalSettings')
        records = list(GlobalSettings.objects.values())
        if records:
            data['core.GlobalSettings'] = records
            print(f"✅ GlobalSettings: {len(records)} records")
    except AttributeError:
        pass
    except Exception as e:
        print(f"⚠️  GlobalSettings: {str(e)[:80]}")
    
    # Shop Models (ALL)
    print("\n🛒 Shop Models:")
    print("=" * 70)
    shop_model_names = ['Product', 'Voucher', 'Order', 'OrderItem']
    
    for model_name in shop_model_names:
        try:
            model_class = getattr(shop_models, model_name)
            records = list(model_class.objects.values())
            if records:
                data[f'shop.{model_name}'] = records
                print(f"✅ {model_name}: {len(records)} records")
        except AttributeError:
            pass
        except Exception as e:
            print(f"⚠️  {model_name}: {str(e)[:80]}")
    
    # Write to file
    output_file = 'complete_database_export.json'
    print(f"\n💾 Writing to {output_file}...")
    
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=2, default=str)
    
    print(f"✅ Export complete! File: {output_file}\n")
    
    total_records = sum(len(records) for records in data.values())
    print(f"📊 Total records exported: {total_records}")
    print(f"📦 Models with data: {len(data)}")
    print(f"\n🖼️  Note: All images are already on Azure Blob Storage!\n")

if __name__ == '__main__':
    export_all_data()
