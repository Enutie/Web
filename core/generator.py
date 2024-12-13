from pathlib import Path
import importlib
import yaml
import sass
import shutil
from typing import Dict, Any, List
from jinja2 import Environment, FileSystemLoader, Template
from .base import Feature, FeatureConfig, NavConfig, SiteConfig

class StaticSiteGenerator:
    def __init__(self, project_root: Path = None):
        self.project_root = project_root or Path.cwd()
        self.core_dir = self.project_root / 'core'
        self.features_dir = self.project_root / 'features'
        self.output_dir = self.project_root / 'public'
        
        # Load configurations
        self.site_config = self._load_site_config()
        self.nav_config = self._load_nav_config()
        
        # Setup Jinja environment
        self.env = self._setup_jinja()
        
        # Discover and load features
        self.features = self._load_features()

    def _load_nav_config(self) -> NavConfig:
        """Load navigation configuration"""
        nav_path = self.core_dir / 'content' / 'data' / 'nav.yaml'
        with open(nav_path, 'r', encoding='utf-8') as f:
            nav_data = yaml.safe_load(f)
            return NavConfig.from_dict(nav_data)

    def _load_site_config(self) -> Dict[str, Any]:
        """Load core site configuration"""
        config_path = self.core_dir / 'content' / 'data' / 'site.yaml'
        with open(config_path, 'r', encoding='utf-8') as f:
            config_data = yaml.safe_load(f)
            # Extract the 'site' key from the YAML
            return config_data['site']

    def _setup_jinja(self) -> Environment:
        """Setup Jinja with core and feature template paths"""
        # Start with core templates
        template_paths = [
            self.core_dir / 'templates',
            self.core_dir / 'templates' / 'components'
        ]
        
        # Add feature template paths
        for feature_dir in self.features_dir.glob('*'):
            if (feature_dir / 'templates').exists():
                template_paths.append(feature_dir / 'templates')
        
        return Environment(
            loader=FileSystemLoader([str(p) for p in template_paths])
        )

    def _load_features(self) -> List[Feature]:
        """Discover and load all features"""
        features = []
        
        for feature_dir in self.features_dir.glob('*'):
            if not feature_dir.is_dir():
                continue
                
            generator_path = feature_dir / 'generator.py'
            if not generator_path.exists():
                continue
            
            module_name = f"features.{feature_dir.name}.generator"
            print(f"Trying to load module: {module_name}")
            try:
                module = importlib.import_module(module_name)
                
                # Look specifically for <FeatureName>Feature class
                feature_class_name = f"{feature_dir.name.title()}Feature"
                print(f"Looking for feature class: {feature_class_name}")
                
                if hasattr(module, feature_class_name):
                    feature_class = getattr(module, feature_class_name)
                    if (isinstance(feature_class, type) and 
                        issubclass(feature_class, Feature) and 
                        feature_class != Feature):
                        print(f"Found feature class: {feature_class.__name__}")
                        feature = feature_class(
                            feature_dir, 
                            self.site_config,
                            self.output_dir,
                            self
                        )
                        features.append(feature)
                else:
                    print(f"Warning: Could not find {feature_class_name} in {module.__name__}")
                        
            except ImportError as e:
                print(f"Warning: Could not load feature {feature_dir.name}: {e}")
            except Exception as e:
                print(f"Error loading feature {feature_dir.name}: {type(e).__name__}: {str(e)}")
        
        return features

    def compile_sass(self):
        """Compile Sass files"""
        # Compile core styles
        main_scss = self.core_dir / 'styles' / 'main.scss'
        if main_scss.exists():
            # Include both core and features directories in the search path
            sass_path = [
                str(self.core_dir / 'styles'),
                str(self.features_dir)
            ]
            
            css = sass.compile(
                filename=str(main_scss),
                include_paths=sass_path
            )
            
            css_path = self.output_dir / 'styles' / 'main.css'
            css_path.parent.mkdir(parents=True, exist_ok=True)
            css_path.write_text(css, encoding='utf-8')

    def copy_static_files(self):
        """Copy static files from all features"""
        for feature in self.features:
            for static_file in feature.get_static_files():
                # Maintain directory structure in output
                rel_path = static_file.relative_to(feature.root_dir)
                dest_path = self.output_dir / rel_path
                
                dest_path.parent.mkdir(parents=True, exist_ok=True)
                shutil.copy2(static_file, dest_path)

    def build_feature(self, feature: Feature):
        """Build a single feature"""
        try:
            # Call pre-build hook
            feature.pre_build()
            
            # Get feature configuration and context
            config = feature.get_config()
            context = feature.get_context()
            
            # Add global context
            context.update({
                'site': self.site_config,
                'nav': self.nav_config,
                'feature': config
            })
            
            # Render each template
            for template_name in feature.get_templates():
                template = self.env.get_template(template_name)
                output = template.render(**context)
                
                # Determine output path
                if config.url_prefix:
                    output_path = self.output_dir / config.url_prefix.lstrip('/') / template_name
                else:
                    output_path = self.output_dir / template_name
                    
                # Write output
                output_path.parent.mkdir(parents=True, exist_ok=True)
                output_path.write_text(output, encoding='utf-8')
            
            # Call post-build hook
            feature.post_build()
            
        except Exception as e:
            print(f"Error building feature {feature.get_config().name}: {str(e)}")
            raise

    def build(self):
        """Build the entire site"""
        print("🔨 Building site...")
        
        # Create output directory
        self.output_dir.mkdir(parents=True, exist_ok=True)
        
        # Compile Sass
        self.compile_sass()
        
        # Build each feature
        for feature in self.features:
            print(f"Building feature: {feature.get_config().name}")
            self.build_feature(feature)
        
        # Copy static files
        self.copy_static_files()
        
        print("✨ Build complete!")

def serve_site():
    """Development server with live reload"""
    from livereload import Server
    
    generator = StaticSiteGenerator()
    
    def rebuild():
        generator.build()
    
    server = Server()
    
    # Watch core and feature directories
    server.watch('core/**/*', rebuild)
    server.watch('features/**/*', rebuild)
    
    print("🚀 Starting development server at http://localhost:8000")
    server.serve(root='public', port=8000, open_url_delay=1)

if __name__ == '__main__':
    import sys
    generator = StaticSiteGenerator()
    
    if len(sys.argv) > 1 and sys.argv[1] == 'serve':
        serve_site()
    else:
        generator.build()