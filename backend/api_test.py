"""
API Testing Script - Test All Production Endpoints
Tests all major API endpoints to ensure everything works
"""
import requests
import json

# Production API base URL
BASE_URL = "https://ninjainflablepark-gbhwbbdna5hjgvf9.centralindia-01.azurewebsites.net"

def test_endpoint(name, url):
    """Test a single endpoint"""
    try:
        response = requests.get(url, timeout=10)
        if response.status_code == 200:
            data = response.json()
            count = len(data) if isinstance(data, list) else 1
            print(f"✅ {name}: {response.status_code} - {count} records")
            return True
        else:
            print(f"⚠️  {name}: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ {name}: Error - {str(e)[:80]}")
        return False

def main():
    print("\n🧪 Testing Production API Endpoints...")
    print("=" * 70)
    print(f"Base URL: {BASE_URL}\n")
    
    # CMS Endpoints
    print("📄 CMS Endpoints:")
    print("-" * 70)
    endpoints = {
        "Pages": f"{BASE_URL}/api/v1/cms/pages/",
        "Activities": f"{BASE_URL}/api/v1/cms/activities/",
        "Banners": f"{BASE_URL}/api/v1/cms/banners/",
        "FAQs": f"{BASE_URL}/api/v1/cms/faqs/",
        "Social Links": f"{BASE_URL}/api/v1/cms/social-links/",
        "Gallery": f"{BASE_URL}/api/v1/cms/gallery/",
        "Instagram Reels": f"{BASE_URL}/api/v1/cms/instagram-reels/",
        "Pricing Plans": f"{BASE_URL}/api/v1/cms/pricing-plans/",
        "Party Packages": f"{BASE_URL}/api/v1/cms/party-packages/",
        "Contact Info": f"{BASE_URL}/api/v1/cms/contact-info/",
        "Stat Cards": f"{BASE_URL}/api/v1/cms/stat-cards/",
        "Menu Sections": f"{BASE_URL}/api/v1/cms/menu-sections/",
        "Group Packages": f"{BASE_URL}/api/v1/cms/group-packages/",
        "Legal Documents": f"{BASE_URL}/api/v1/cms/legal-documents/",
        "Page Sections": f"{BASE_URL}/api/v1/cms/page-sections/",
    }
    
    cms_passed = 0
    for name, url in endpoints.items():
        if test_endpoint(name, url):
            cms_passed += 1
    
    # Booking Endpoints
    print(f"\n📅 Booking Endpoints:")
    print("-" * 70)
    booking_endpoints = {
        "Customers": f"{BASE_URL}/api/v1/bookings/customers/",
        "Bookings": f"{BASE_URL}/api/v1/bookings/bookings/",
        "Booking Blocks": f"{BASE_URL}/api/v1/bookings/booking-blocks/",
        "Transactions": f"{BASE_URL}/api/v1/bookings/transactions/",
        "Waivers": f"{BASE_URL}/api/v1/bookings/waivers-old/",
    }
    
    booking_passed = 0
    for name, url in booking_endpoints.items():
        if test_endpoint(name, url):
            booking_passed += 1
    
    # Summary
    print(f"\n📊 Test Summary:")
    print("=" * 70)
    total_endpoints = len(endpoints) + len(booking_endpoints)
    total_passed = cms_passed + booking_passed
    print(f"✅ Passed: {total_passed}/{total_endpoints}")
    print(f"❌ Failed: {total_endpoints - total_passed}/{total_endpoints}")
    
    if total_passed == total_endpoints:
        print(f"\n🎉 All API endpoints are working correctly!\n")
    else:
        print(f"\n⚠️  Some endpoints need attention.\n")

if __name__ == '__main__':
    main()
