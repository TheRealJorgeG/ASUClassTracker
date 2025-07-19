from bs4 import BeautifulSoup
from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
import time
import sys
import json
import os
import signal

def signal_handler(signum, frame):
    """Handle timeout signals gracefully"""
    print(json.dumps({"error": "Script timeout"}), flush=True)
    sys.exit(1)

# Set up signal handler for SIGTERM
signal.signal(signal.SIGTERM, signal_handler)
signal.signal(signal.SIGALRM, signal_handler)

def getClassInfo(classNumber):
    driver = None
    try:
        # Set alarm for 25 seconds (before Node.js 30s timeout)
        signal.alarm(25)
        
        print(f"Starting lookup for class {classNumber}", file=sys.stderr, flush=True)
        
        chrome_options = Options()
        # Essential options for headless Chrome on hosting platforms
        chrome_options.add_argument('--headless')
        chrome_options.add_argument('--no-sandbox')
        chrome_options.add_argument('--disable-dev-shm-usage')
        chrome_options.add_argument('--disable-gpu')
        chrome_options.add_argument('--disable-extensions')
        chrome_options.add_argument('--disable-plugins')
        chrome_options.add_argument('--disable-images')
        chrome_options.add_argument('--disable-javascript')  # May help with performance
        chrome_options.add_argument('--window-size=1920,1080')
        chrome_options.add_argument('--user-agent=Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36')
        chrome_options.add_argument('--log-level=3')
        
        # Additional stability options
        chrome_options.add_argument('--disable-background-timer-throttling')
        chrome_options.add_argument('--disable-renderer-backgrounding')
        chrome_options.add_argument('--disable-backgrounding-occluded-windows')
        
        print("Initializing Chrome driver", file=sys.stderr, flush=True)
        driver = webdriver.Chrome(options=chrome_options)
        
        # Set page load timeout
        driver.set_page_load_timeout(15)
        
        url = f"https://catalog.apps.asu.edu/catalog/classes/classlist?campusOrOnlineSelection=A&honors=F&keywords={classNumber}&promod=F&searchType=all&term=2257"
        print(f"Fetching URL: {url}", file=sys.stderr, flush=True)
        
        driver.get(url)
        
        # Wait for page to load with explicit wait
        wait = WebDriverWait(driver, 10)
        try:
            # Wait for the results to appear
            wait.until(EC.presence_of_element_located((By.CSS_SELECTOR, '.class-results-row, .no-results')))
        except Exception as e:
            print(f"Timeout waiting for page elements: {e}", file=sys.stderr, flush=True)
        
        print("Parsing page content", file=sys.stderr, flush=True)
        html_content = driver.page_source
        soup = BeautifulSoup(html_content, 'html.parser')

        # Check if no results found
        no_results = soup.find(text=lambda text: text and 'no classes found' in text.lower())
        if no_results:
            return None

        # Course and title
        boldElements = soup.select('.pointer .bold-hyperlink')
        course = boldElements[0].get_text(strip=True) if len(boldElements) > 0 else "N/A"
        title = boldElements[1].get_text(strip=True) if len(boldElements) > 1 else "N/A"

        # Instructors
        instructorDivs = soup.find_all("div", class_="class-results-cell instructor")
        instructors = []
        for div in instructorDivs:
            aTag = div.find("a", class_="link-color")
            if aTag:
                instructors.append(aTag.get_text(strip=True))
            else:
                instructors.append(div.get_text(strip=True))

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
        for seat in seatCounts:
            if seat and len(seat) > 0 and seat[0].isdigit() and int(seat[0]) > 0:
                seat_status = "Open"
                break

        print("Successfully parsed class information", file=sys.stderr, flush=True)

        if not seatCounts and course == "N/A":
            return None

        return {
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

    except Exception as e:
        print(f"Error in getClassInfo: {str(e)}", file=sys.stderr, flush=True)
        return None
    finally:
        # Clean up
        signal.alarm(0)  # Cancel the alarm
        if driver:
            try:
                driver.quit()
                print("Driver closed successfully", file=sys.stderr, flush=True)
            except Exception as e:
                print(f"Error closing driver: {e}", file=sys.stderr, flush=True)

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print(json.dumps({"error": "No class number provided"}), flush=True)
        sys.exit(1)
        
    input_class_number = sys.argv[1]
    print(f"Starting script for class {input_class_number}", file=sys.stderr, flush=True)
    
    class_info = getClassInfo(input_class_number)
    if class_info:
        print(json.dumps(class_info), flush=True)
    else:
        print(json.dumps({"error": "Class not found"}), flush=True)
    
    print("Script completed", file=sys.stderr, flush=True)
    sys.stdout.flush()
    sys.stderr.flush()