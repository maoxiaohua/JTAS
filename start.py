#!/usr/bin/env python3
"""
JIRA效率分析系统启动脚本
"""

import subprocess
import sys
import os

def install_requirements():
    """安装依赖包"""
    print("Installing Python dependencies...")
    try:
        subprocess.check_call([sys.executable, '-m', 'pip', 'install', '-r', 'requirements.txt'])
        print("Dependencies installed successfully!")
        return True
    except subprocess.CalledProcessError as e:
        print(f"Failed to install dependencies: {e}")
        return False

def check_python_version():
    """检查Python版本"""
    if sys.version_info < (3, 8):
        print("Python 3.8+ required")
        return False
    print(f"Python version: {sys.version}")
    return True

def start_application():
    """启动应用"""
    print("Starting JIRA Efficiency Analysis System...")
    print("Web Interface: http://localhost:5000")
    print("Press Ctrl+C to stop")
    print("-" * 50)
    
    try:
        from app import app
        app.run(debug=True, host='0.0.0.0', port=5000)
    except ImportError as e:
        print(f"Import failed: {e}")
        print("Please ensure all dependencies are installed")
    except KeyboardInterrupt:
        print("\nSystem stopped")

def main():
    print("=" * 50)
    print("JIRA Efficiency Analysis System - Python Version")
    print("=" * 50)
    
    # 检查Python版本
    if not check_python_version():
        return
    
    # 检查requirements.txt是否存在
    if not os.path.exists('requirements.txt'):
        print("requirements.txt not found")
        return
    
    # 安装依赖
    if not install_requirements():
        print("Please run manually: pip install -r requirements.txt")
        return
    
    # 启动应用
    start_application()

if __name__ == '__main__':
    main()