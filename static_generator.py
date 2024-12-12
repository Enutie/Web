import os
import markdown
import shutil
import sass
import yaml
from pathlib import Path
from typing import Dict, Any
from jinja2 import Environment, FileSystemLoader
from dataclasses import dataclass
from livereload import Server

@dataclass
class SiteConfig:
    """Site configuration data class"""
    title: str
    description: str
    author: str
    social: Dict[str, str]
    pages: Dict[str, Any]

class StaticSiteGenerator:
    def __init__(self, content_dir='content', output_dir='public'):
        self.content_dir = Path(content_dir)
        self.output_dir = Path(output_dir)
        self.env = Environment(
            loader=FileSystemLoader([
                'templates/pages',
                'templates'
            ])
        )
        self.site_config = self._load_site_config()
        self.nav_config = self._load_nav_config()

    def _load_site_config(self) -> SiteConfig:
        """Load site configuration from YAML"""
        config_path = self.content_dir / 'data' / 'site.yaml'
        with open(config_path, 'r', encoding='utf-8') as f:
            config_data = yaml.safe_load(f)
            return SiteConfig(**config_data['site'])

    def _load_nav_config(self) -> Dict:
        """Load navigation configuration"""
        nav_path = self.content_dir / 'data' / 'nav.yaml'
        with open(nav_path, 'r', encoding='utf-8') as f:
            return yaml.safe_load(f)
        
    def get_page_context(self, page_name: str, additional_context: Dict = None) -> Dict:
        """Get context for a specific page"""
        context = {
            'site': self.site_config,
            'nav': self.nav_config,
            'page': self.site_config.pages.get(page_name, {}),
        }
        if additional_context:
            context.update(additional_context)
        return context
        
    def setup_directories(self):
        """Create necessary directories if they don't exist"""
        directories = [
            self.content_dir / 'posts',
            self.content_dir / 'images',
            self.content_dir / 'videos',
            self.content_dir / 'music',
            self.output_dir,
            self.output_dir / 'styles'
        ]
        for directory in directories:
            directory.mkdir(parents=True, exist_ok=True)
            
    def copy_media(self):
        """Copy media files to output directory"""
        media_dirs = ['images', 'videos', 'music']
        for dir_name in media_dirs:
            src_dir = self.content_dir / dir_name
            dst_dir = self.output_dir / dir_name
            if src_dir.exists():
                if dst_dir.exists():
                    shutil.rmtree(dst_dir)
                shutil.copytree(src_dir, dst_dir)
                
    def get_media_galleries(self):
        """Create galleries of media files"""
        galleries = {}
        media_types = {
            'images': ['.jpg', '.jpeg', '.png', '.gif'],
            'videos': ['.mp4', '.webm'],
            'music': ['.mp3', '.wav']
        }
        
        for media_type, extensions in media_types.items():
            media_dir = self.content_dir / media_type
            if media_dir.exists():
                galleries[media_type] = [
                    str(f.relative_to(self.content_dir))
                    for f in media_dir.glob('**/*')
                    if f.suffix.lower() in extensions
                ]
                
        return galleries
                
    def convert_markdown_files(self):
        """Convert markdown files to HTML"""
        md = markdown.Markdown(extensions=[
            'meta',
            'attr_list',  
            'fenced_code',  
            'tables'  
        ])
        posts = []
        
        for md_file in (self.content_dir / 'posts').glob('*.md'):
            with open(md_file, 'r', encoding='utf-8') as f:
                content = f.read()
                
            html = md.convert(content)
            meta = getattr(md, 'Meta', {})
            
            posts.append({
                'content': html,
                'title': meta.get('title', [md_file.stem])[0],
                'date': meta.get('date', [''])[0],
                'slug': md_file.stem
            })
            
        return sorted(posts, key=lambda x: x['date'], reverse=True)
    
    def compile_sass(self):
        """Compile Sass files to CSS"""
        scss_path = Path('styles/scss/main.scss')
        css_output_path = self.output_dir / 'styles/main.css'
        
        css_output_path.parent.mkdir(parents=True, exist_ok=True)
        
        if scss_path.exists():
            css = sass.compile(filename=str(scss_path))
            css_output_path.write_text(css, encoding='utf-8')
        
    def build(self):
        """Build the entire site"""
        print("🔨 Building site...")
        self.setup_directories()
        self.compile_sass()
        self.copy_media()

        posts = self.convert_markdown_files()
        galleries = self.get_media_galleries()

        for post in posts:
            self.render_post(post)

        templates = {
            'index.html': self.get_page_context('home', {
                'posts': posts,
                'galleries': galleries
            }),
            'posts.html': self.get_page_context('posts', {
                'posts': posts
            }),
            'gallery.html': self.get_page_context('gallery', {
                'galleries': galleries
            })
        }

        # Build pages
        for template_name, context in templates.items():
            self.render_template(template_name, context)

        print("✨ Build complete!")

    def render_post(self, post: Dict):
        """Render a single post with template wrapping"""
        context = self.get_page_context('posts')  
        context['post'] = post
        
        template = self.env.get_template('pages/post.html')
        output = template.render(**context)  
        
        output_path = self.output_dir / 'posts' / f"{post['slug']}.html"
        output_path.parent.mkdir(exist_ok=True)
        output_path.write_text(output, encoding='utf-8')

    def render_template(self, template_name: str, context: Dict):
        """Render a template with given context"""
        template = self.env.get_template(f'pages/{template_name}')
        output = template.render(**context)
        
        output_path = self.output_dir / template_name
        output_path.parent.mkdir(exist_ok=True)
        output_path.write_text(output, encoding='utf-8')

def serve_site():
    """Serve the site with live reload"""
    generator = StaticSiteGenerator()
    
    generator.build()
    
    def rebuild():
        generator.build()
    
    server = Server()
    
    server.watch('content/**/*.md', rebuild)
    server.watch('templates/**/*.html', rebuild)
    server.watch('styles/**/*.scss', rebuild)
    server.watch('content/images/*', rebuild)
    server.watch('content/videos/*', rebuild)
    server.watch('content/music/*', rebuild)
    
    print("🚀 Starting development server at http://localhost:8000")
    server.serve(root='public', port=8000, open_url_delay=1)

if __name__ == '__main__':
    import sys
    if len(sys.argv) > 1 and sys.argv[1] == 'build':
        # Just build the site
        generator = StaticSiteGenerator()
        generator.build()
    else:
        # Serve with live reload
        serve_site()