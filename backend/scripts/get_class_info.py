from bs4 import BeautifulSoup
from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
import time
import sys
import json
import os
import tempfile
import shutil
import psutil

def get_memory_usage():
    """Returns memory usage of the current process in MB."""
    try:
        process = psutil.Process(os.getpid())
        mem_info = process.memory_info()
        return {
            "rss": round(mem_info.rss / (1024 * 1024), 2),  # Resident Set Size
            "vms": round(mem_info.vms / (1024 * 1024), 2)   # Virtual Memory Size
        }
    except Exception as e:
        print(f"[{time.time()}] [MEMORY_ERROR] {e}", file=sys.stderr)
        return {"rss": 0, "vms": 0}

def create_chrome_options():
    """Create Chrome options optimized for containerized environments."""
    chrome_options = Options()
    
    # Create a unique temporary directory for this session
    user_data_dir = tempfile.mkdtemp(prefix='chrome_user_data_')
    
    # Essential options for Docker/container environments
    chrome_options.add_argument('--headless')
    chrome_options.add_argument('--no-sandbox')
    chrome_options.add_argument('--disable-dev-shm-usage')
    chrome_options.add_argument('--disable-gpu')
    chrome_options.add_argument('--disable-software-rasterizer')
    chrome_options.add_argument('--disable-background-timer-throttling')
    chrome_options.add_argument('--disable-backgrounding-occluded-windows')
    chrome_options.add_argument('--disable-renderer-backgrounding')
    chrome_options.add_argument('--disable-features=TranslateUI')
    chrome_options.add_argument('--disable-ipc-flooding-protection')
    chrome_options.add_argument('--single-process')
    chrome_options.add_argument('--disable-web-security')
    chrome_options.add_argument('--disable-features=VizDisplayCompositor')
    
    # User data directory - use unique temp directory
    chrome_options.add_argument(f'--user-data-dir={user_data_dir}')
    
    # Window and display options
    chrome_options.add_argument('--window-size=1920,1080')
    chrome_options.add_argument('--start-maximized')
    
    # Disable unnecessary features
    chrome_options.add_argument('--disable-extensions')
    chrome_options.add_argument('--disable-plugins')
    chrome_options.add_argument('--disable-images')
    chrome_options.add_argument('--disable-javascript')  # We don't need JS for scraping
    chrome_options.add_argument('--disable-default-apps')
    chrome_options.add_argument('--disable-sync')
    chrome_options.add_argument('--disable-background-networking')
    chrome_options.add_argument('--disable-component-extensions-with-background-pages')
    
    # Security and crash handling
    chrome_options.add_argument('--disable-client-side-phishing-detection')
    chrome_options.add_argument('--disable-crash-reporter')
    chrome_options.add_argument('--disable-oopr-debug-crash-dump')
    chrome_options.add_argument('--no-crash-upload')
    chrome_options.add_argument('--disable-in-process-stack-traces')
    
    # Memory optimizations
    chrome_options.add_argument('--memory-pressure-off')
    chrome_options.add_argument('--max_old_space_size=4096')
    
    # Logging
    chrome_options.add_argument('--log-level=3')
    chrome_options.add_argument('--silent')
    chrome_options.add_argument('--disable-logging')
    chrome_options.add_argument('--disable-system-font-check')
    
    # User agent
    chrome_options.add_argument('--user-agent=Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36')
    
    # Additional stability options
    chrome_options.add_argument('--disable-blink-features=AutomationControlled')
    chrome_options.add_argument('--disable-dev-tools')
    chrome_options.add_argument('--no-first-run')
    chrome_options.add_argument('--no-default-browser-check')
    chrome_options.add_argument('--disable-infobars')
    chrome_options.add_argument('--disable-notifications')
    
    return chrome_options, user_data_dir

def getClassInfo(classNumber):
    print(f"[{time.time()}] [START] Processing class {classNumber}", file=sys.stderr)
    print(f"[{time.time()}] [MEMORY_TRACK] Before WebDriver init: {get_memory_usage()}", file=sys.stderr)

    driver = None
    user_data_dir = None
    
    try:
        # Create Chrome options
        chrome_options, user_data_dir = create_chrome_options()
        
        print(f"[{time.time()}] [CHROME_SETUP] User data dir: {user_data_dir}", file=sys.stderr)
        
        # Try to create the WebDriver
        try:
            # Try with explicit service first
            service = Service('/usr/local/bin/chromedriver')
            driver = webdriver.Chrome(service=service, options=chrome_options)
            print(f"[{time.time()}] [DRIVER_SUCCESS] WebDriver created with explicit service", file=sys.stderr)
        except Exception as service_error:
            print(f"[{time.time()}] [DRIVER_FALLBACK] Explicit service failed: {service_error}", file=sys.stderr)
            # Fallback to default
            driver = webdriver.Chrome(options=chrome_options)
            print(f"[{time.time()}] [DRIVER_SUCCESS] WebDriver created with default service", file=sys.stderr)

        print(f"[{time.time()}] [MEMORY_TRACK] After WebDriver init: {get_memory_usage()}", file=sys.stderr)

        # Set timeouts
        driver.set_page_load_timeout(30)
        driver.implicitly_wait(10)

        url = f"https://catalog.apps.asu.edu/catalog/classes/classlist?campusOrOnlineSelection=A&honors=F&keywords={classNumber}&promod=F&searchType=all&term=2257"
        
        print(f"[{time.time()}] [URL_FETCH] Fetching: {url}", file=sys.stderr)
        driver.get(url)
        
        # Wait for the page to load properly
        try:
            WebDriverWait(driver, 15).until(
                EC.presence_of_element_located((By.CLASS_NAME, "class-results-cell"))
            )
            print(f"[{time.time()}] [PAGE_LOADED] Page loaded successfully", file=sys.stderr)
        except Exception as wait_error:
            print(f"[{time.time()}] [PAGE_TIMEOUT] Explicit wait timeout: {wait_error}", file=sys.stderr)
            # Continue anyway, sometimes the page loads but the wait times out
            time.sleep(2)  # Give it a bit more time

        print(f"[{time.time()}] [MEMORY_TRACK] After driver.get and wait: {get_memory_usage()}", file=sys.stderr)

        html_content = driver.page_source
        soup = BeautifulSoup(html_content, 'html.parser')

        # Debug: Check if we have class results
        class_results = soup.find_all("div", class_="class-results-cell")
        print(f"[{time.time()}] [DEBUG] Found {len(class_results)} class result cells", file=sys.stderr)

        # Course and title
        boldElements = soup.select('.pointer .bold-hyperlink')
        course = boldElements[0].get_text(strip=True) if len(boldElements) > 0 else "N/A"
        title = boldElements[1].get_text(strip=True) if len(boldElements) > 1 else "N/A"

        print(f"[{time.time()}] [DEBUG] Course: {course}, Title: {title}", file=sys.stderr)

        # Check if we found valid class data
        if course == "N/A" and title == "N/A":
            print(f"[{time.time()}] [CLASS_NOT_FOUND] No class information found", file=sys.stderr)
            return None

        # Instructors
        instructorDivs = soup.find_all("div", class_="class-results-cell instructor")
        instructors = []
        for div in instructorDivs:
            aTag = div.find("a", class_="link-color")
            if aTag:
                instructor_name = aTag.get_text(strip=True)
                if instructor_name:
                    instructors.append(instructor_name)
            else:
                instructor_name = div.get_text(strip=True)
                if instructor_name:
                    instructors.append(instructor_name)

        # Extract Days
        daysElement = soup.select_one('.class-results-cell.pull-left.days p')
        days = daysElement.get_text(strip=True) if daysElement else "N/A"

        # Extract Start Time
        startTimeElement = soup.select_one('.class-results-cell.pull-left.start p')
        start_time = startTimeElement.get_text(strip=True) if startTimeElement else "N/A"

        # Extract End Time
        endTimeElement = soup.select_one('.class-results-cell.end p')
        end_time = endTimeElement.get_text(strip=True) if endTimeElement else "N/A"

        # Combine start and end times
        if start_time != "N/A" and end_time != "N/A":
            combined_time = f"{start_time} - {end_time}"
        else:
            combined_time = "N/A"

        # Extract Location
        locationElement = soup.select_one('.class-results-cell.location p')
        location = locationElement.get_text(strip=True) if locationElement else "N/A"

        # Extract Dates
        datesElement = soup.select_one('.class-results-cell.d-none.d-lg-block.dates p')
        dates = datesElement.get_text(strip=True) if datesElement else "N/A"

        # Extract Units (directly in div)
        unitsElement = soup.select_one('.class-results-cell.d-none.d-lg-block.units')
        units = unitsElement.get_text(strip=True) if unitsElement else "N/A"

        # Open/closed seats
        seatElements = soup.select('.seats .text-nowrap')
        seatCounts = [seat.get_text() for seat in seatElements]
        seat_status = "Closed"
        
        print(f"[{time.time()}] [DEBUG] Seat counts: {seatCounts}", file=sys.stderr)
        
        for seat in seatCounts:
            if seat and len(seat) > 0:
                try:
                    if int(seat[0]) > 0:
                        seat_status = "Open"
                        break
                except (ValueError, IndexError):
                    continue

        print(f"[{time.time()}] [MEMORY_TRACK] Before driver.quit: {get_memory_usage()}", file=sys.stderr)

        if not seatCounts:
            print(f"[{time.time()}] [WARNING] No seat information found", file=sys.stderr)

        result = {
            "course": course,
            "title": title,
            "number": classNumber,
            "instructors": instructors,
            "days": days,
            "time": combined_time,
            "location": location,
            "dates": dates,
            "units": units,
            "seatStatus": seat_status,
            "startTime": start_time,
            "endTime": end_time,
        }
        
        print(f"[{time.time()}] [SUCCESS] Class data extracted successfully", file=sys.stderr)
        return result

    except Exception as e:
        print(f"[{time.time()}] [ERROR] Error in getClassInfo: {e}", file=sys.stderr)
        import traceback
        traceback.print_exc(file=sys.stderr)
        return None
        
    finally:
        # Clean up WebDriver
        if driver:
            try:
                driver.quit()
                print(f"[{time.time()}] [CLEANUP] WebDriver quit successfully", file=sys.stderr)
            except Exception as quit_error:
                print(f"[{time.time()}] [CLEANUP_ERROR] Error quitting driver: {quit_error}", file=sys.stderr)
        
        # Clean up temporary user data directory
        if user_data_dir and os.path.exists(user_data_dir):
            try:
                shutil.rmtree(user_data_dir)
                print(f"[{time.time()}] [CLEANUP] Temp directory cleaned: {user_data_dir}", file=sys.stderr)
            except Exception as cleanup_error:
                print(f"[{time.time()}] [CLEANUP_ERROR] Error cleaning temp dir: {cleanup_error}", file=sys.stderr)
        
        print(f"[{time.time()}] [MEMORY_TRACK] After cleanup: {get_memory_usage()}", file=sys.stderr)

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print(json.dumps({"error": "Class number required"}))
        sys.exit(1)
        
    input_class_number = sys.argv[1]
    class_info = getClassInfo(input_class_number)
    
    if class_info:
        print(json.dumps(class_info))
    else:
        print(json.dumps({"error": "Class not found"}))

    sys.stdout.flush()