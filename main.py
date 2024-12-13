import sys
from pathlib import Path
from core import StaticSiteGenerator, serve_site

def main():
    # Get the project root (where main.py is located)
    project_root = Path(__file__).parent
    
    if len(sys.argv) > 1:
        command = sys.argv[1]
        if command == 'serve':
            print("🚀 Starting development server...")
            serve_site()
        elif command == 'build':
            print("🔨 Building site...")
            generator = StaticSiteGenerator(project_root)
            generator.build()
        else:
            print(f"Unknown command: {command}")
            print("Available commands: serve, build")
    else:
        # Default to build if no command provided
        print("🔨 Building site...")
        generator = StaticSiteGenerator(project_root)
        generator.build()

if __name__ == '__main__':
    main()