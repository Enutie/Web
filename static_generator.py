import os
import markdown
import shutil
from pathlib import Path
from jinja2 import Environment, FileSystemLoader

class StaticSiteGenerator:
    def __init__(self, content_dir='content', output_dir='public'):
        self.content_dir = Path(content_dir)
        self.output_dir = Path(output_dir)
        self.env = Environment(loader=FileSystemLoader('templates'))
        
    def setup_directories(self):
        """Create necessary directories if they don't exist"""
        directories = [
            self.content_dir / 'posts',
            self.content_dir / 'images',
            self.content_dir / 'videos',
            self.content_dir / 'music',
            self.output_dir
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
        md = markdown.Markdown(extensions=['meta'])
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
        
    def build(self):
        """Build the entire site"""
        self.setup_directories()
        self.copy_media()
        
        # Get content
        posts = self.convert_markdown_files()
        galleries = self.get_media_galleries()
        
        # Render pages
        templates = {
            'index.html': {'posts': posts, 'galleries': galleries},
            'posts.html': {'posts': posts},
        }
        
        for template_name, context in templates.items():
            template = self.env.get_template(template_name)
            output = template.render(**context)
            
            with open(self.output_dir / template_name, 'w', encoding='utf-8') as f:
                f.write(output)
                
        # Generate individual post pages
        post_template = self.env.get_template('post.html')  # Changed from posts.html to post.html
        for post in posts:
            output = post_template.render(post=post)
            post_path = self.output_dir / 'posts' / f"{post['slug']}.html"
            post_path.parent.mkdir(exist_ok=True)
            
            with open(post_path, 'w', encoding='utf-8') as f:
                f.write(output)

if __name__ == '__main__':
    generator = StaticSiteGenerator()
    generator.build()