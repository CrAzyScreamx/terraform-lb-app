import os
import ssl
from peewee import MySQLDatabase
from dotenv import load_dotenv
import logging

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Load environment variables from .env file
load_dotenv()

# Path to DigiCert Global Root CA certificate
DIGICERT_CA_CERT_PATH = os.path.join(os.path.dirname(__file__), 'DigiCertGlobalRootCA.crt.pem')

# Database configuration with SSL support
def get_db_config_with_ssl():
    """Get database configuration with SSL enabled"""
    return {
        'host': os.getenv('DB_HOST'),
        'port': int(os.getenv('DB_PORT', 3306)),
        'user': os.getenv('DB_USER'),
        'password': os.getenv('DB_PASSWORD'),
        'database': os.getenv('DB_NAME'),
        'charset': 'utf8mb4',
        'ssl': {
            'ca': DIGICERT_CA_CERT_PATH,
            'check_hostname': False,
            'verify_mode': ssl.CERT_REQUIRED
        }
    }

def get_db_config_without_ssl():
    """Get database configuration without SSL"""
    return {
        'host': os.getenv('DB_HOST'),
        'port': int(os.getenv('DB_PORT', 3306)),
        'user': os.getenv('DB_USER'),
        'password': os.getenv('DB_PASSWORD'),
        'database': os.getenv('DB_NAME'),
        'charset': 'utf8mb4'
    }

# Try to create database connection with SSL first, then fallback
def create_database_connection():
    """Create database connection with SSL fallback"""
    
    # First, try with SSL if certificate exists
    if os.path.exists(DIGICERT_CA_CERT_PATH):
        try:
            logger.info("Attempting to connect to database with SSL...")
            ssl_config = get_db_config_with_ssl()
            db = MySQLDatabase(**ssl_config)
            # Test the connection
            db.connect()
            db.close()
            logger.info("✅ SSL connection successful")
            return db
        except Exception as e:
            logger.warning(f"⚠️ SSL connection failed: {e}")
            logger.info("Attempting fallback to unsecured connection...")
    else:
        logger.warning(f"⚠️ DigiCert CA certificate not found at {DIGICERT_CA_CERT_PATH}")
        logger.info("Attempting unsecured connection...")
    
    # Fallback to unsecured connection
    try:
        no_ssl_config = get_db_config_without_ssl()
        db = MySQLDatabase(**no_ssl_config)
        # Test the connection
        db.connect()
        db.close()
        logger.info("✅ Unsecured connection successful")
        return db
    except Exception as e:
        logger.error(f"❌ All connection attempts failed: {e}")
        raise

# Initialize database connection
database = create_database_connection()

def connect_db():
    """Connect to the database"""
    if database.is_closed():
        database.connect()

def close_db():
    """Close database connection"""
    if not database.is_closed():
        database.close()

def create_tables():
    """Create database tables"""
    from models import Task
    database.create_tables([Task], safe=True)
