# setup_and_run.py
"""
Smart Academic Portal - Complete Setup & Run Script
Team: Mystic Coders
"""

import os
import sys
import subprocess
import platform

def print_banner():
    print("""
    ╔══════════════════════════════════════════════════════════╗
    ║        🎓 SMART ACADEMIC PORTAL - SETUP & RUN 🎓        ║
    ║                    Mystic Coders                        ║
    ╚══════════════════════════════════════════════════════════╝
    """)

def check_python():
    """Check Python version"""
    print("\n📌 Checking Python installation...")
    try:
        version = sys.version_info
        if version.major >= 3 and version.minor >= 8:
            print(f"   ✅ Python {version.major}.{version.minor}.{version.micro} detected")
            return True
        else:
            print(f"   ❌ Python 3.8+ required. Current: {version.major}.{version.minor}")
            return False
    except:
        print("   ❌ Python not found!")
        return False

def check_node():
    """Check Node.js installation"""
    print("\n📌 Checking Node.js installation...")
    try:
        result = subprocess.run(['node', '--version'], capture_output=True, text=True)
        version = result.stdout.strip()
        print(f"   ✅ Node.js {version} detected")
        return True
    except:
        print("   ❌ Node.js not found! Please install from https://nodejs.org")
        return False

def check_npm():
    """Check npm installation"""
    print("\n📌 Checking npm installation...")
    try:
        result = subprocess.run(['npm', '--version'], capture_output=True, text=True)
        version = result.stdout.strip()
        print(f"   ✅ npm {version} detected")
        return True
    except:
        print("   ❌ npm not found!")
        return False

def create_virtual_env():
    """Create Python virtual environment"""
    print("\n📌 Setting up Python virtual environment...")
    venv_path = "backend/venv"
    
    if os.path.exists(venv_path):
        print("   ⚠️  Virtual environment already exists")
        return True
    
    try:
        subprocess.run([sys.executable, '-m', 'venv', venv_path], check=True)
        print("   ✅ Virtual environment created")
        return True
    except Exception as e:
        print(f"   ❌ Failed to create virtual environment: {e}")
        return False

def get_python_path():
    """Get the Python executable path in venv"""
    if platform.system() == 'Windows':
        return os.path.join('backend', 'venv', 'Scripts', 'python.exe')
    else:
        return os.path.join('backend', 'venv', 'bin', 'python')

def get_pip_path():
    """Get the pip executable path in venv"""
    if platform.system() == 'Windows':
        return os.path.join('backend', 'venv', 'Scripts', 'pip.exe')
    else:
        return os.path.join('backend', 'venv', 'bin', 'pip')

def install_backend_dependencies():
    """Install Python packages"""
    print("\n📌 Installing backend dependencies...")
    pip = get_pip_path()
    
    if not os.path.exists(pip):
        print("   ❌ pip not found in virtual environment")
        return False
    
    try:
        subprocess.run([pip, 'install', '--upgrade', 'pip'], check=True)
        subprocess.run([pip, 'install', '-r', 'backend/requirements.txt'], check=True)
        print("   ✅ Backend dependencies installed")
        return True
    except Exception as e:
        print(f"   ❌ Failed to install dependencies: {e}")
        print("   Try running manually:")
        print(f"   {pip} install -r backend/requirements.txt")
        return False

def install_frontend_dependencies():
    """Install npm packages"""
    print("\n📌 Installing frontend dependencies...")
    
    if not os.path.exists('frontend/package.json'):
        print("   ❌ package.json not found!")
        return False
    
    try:
        subprocess.run(['npm', 'install'], cwd='frontend', check=True)
        print("   ✅ Frontend dependencies installed")
        return True
    except Exception as e:
        print(f"   ❌ Failed to install frontend dependencies: {e}")
        return False

def create_env_file():
    """Create .env file if not exists"""
    print("\n📌 Setting up environment configuration...")
    env_path = 'backend/.env'
    
    if os.path.exists(env_path):
        print("   ⚠️  .env file already exists")
        return True
    
    env_content = """# Smart Academic Portal - Environment Configuration
SECRET_KEY=mystic-coders-smart-portal-secret-key-2024
DATABASE_URL=sqlite:///./smart_portal.db
DEBUG=True
ALLOWED_ORIGINS=["http://localhost:3000","http://127.0.0.1:3000"]
MODEL_PATH=./data/models
UPLOAD_DIR=./data/uploads
"""
    
    try:
        with open(env_path, 'w') as f:
            f.write(env_content)
        print("   ✅ .env file created")
        return True
    except Exception as e:
        print(f"   ❌ Failed to create .env: {e}")
        return False

def initialize_database():
    """Initialize the database"""
    print("\n📌 Initializing database...")
    python = get_python_path()
    
    if not os.path.exists(python):
        print("   ❌ Python not found in virtual environment")
        return False
    
    try:
        # Run database initialization
        result = subprocess.run(
            [python, '-c', 'from app.core.database import init_db; init_db(); print("Database initialized successfully")'],
            cwd='backend',
            capture_output=True,
            text=True
        )
        print(f"   {result.stdout.strip()}")
        return True
    except Exception as e:
        print(f"   ⚠️  Database will be created on first run: {e}")
        return True  # Not critical

def run_backend():
    """Instructions for running backend"""
    print("\n" + "="*60)
    print("🚀 HOW TO RUN THE BACKEND")
    print("="*60)
    
    if platform.system() == 'Windows':
        activate_cmd = r'backend\venv\Scripts\activate'
    else:
        activate_cmd = 'source backend/venv/bin/activate'
    
    print(f"""
    Open a NEW terminal and run:

    1. Activate virtual environment:
       {activate_cmd}

    2. Navigate to backend:
       cd backend

    3. Run the server:
       python run.py
       
       OR directly:
       uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

    4. Open API docs:
       http://localhost:8000/api/docs
    """)

def run_frontend():
    """Instructions for running frontend"""
    print("\n" + "="*60)
    print("🎨 HOW TO RUN THE FRONTEND")
    print("="*60)
    
    print("""
    Open ANOTHER new terminal and run:

    1. Navigate to frontend:
       cd frontend

    2. Start the React app:
       npm start

    3. Open in browser:
       http://localhost:3000
    """)

def main():
    print_banner()
    
    # Check prerequisites
    checks = [
        check_python(),
        check_node(),
        check_npm(),
    ]
    
    if not all(checks):
        print("\n❌ Please install missing prerequisites and try again.")
        sys.exit(1)
    
    # Setup backend
    print("\n" + "="*60)
    print("📦 BACKEND SETUP")
    print("="*60)
    
    backend_steps = [
        create_virtual_env(),
        install_backend_dependencies(),
        create_env_file(),
        initialize_database(),
    ]
    
    if all(backend_steps):
        print("\n✅ Backend setup complete!")
    else:
        print("\n⚠️  Some backend steps had issues. Check messages above.")
    
    # Setup frontend
    print("\n" + "="*60)
    print("🎨 FRONTEND SETUP")
    print("="*60)
    
    frontend_steps = [
        install_frontend_dependencies(),
    ]
    
    if all(frontend_steps):
        print("\n✅ Frontend setup complete!")
    else:
        print("\n⚠️  Some frontend steps had issues. Check messages above.")
    
    # Print run instructions
    run_backend()
    run_frontend()
    
    print("\n" + "="*60)
    print("🎉 SETUP COMPLETE! HAPPY CODING!")
    print("="*60)
    print("\n📝 Default URLs:")
    print("   Frontend: http://localhost:3000")
    print("   Backend API: http://localhost:8000")
    print("   API Documentation: http://localhost:8000/api/docs")
    print("\n👥 Team: Mystic Coders")
    print("👨‍🏫 Mentor: Dr. K.C. Rajheshwari")
    print()

if __name__ == "__main__":
    main()