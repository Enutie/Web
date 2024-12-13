from pathlib import Path
from typing import Dict, Any, List
from datetime import datetime
from jinja2 import Environment
from core.base import MarkdownFeature, FeatureConfig

class BlogFeature(MarkdownFeature):
    def get_config(self) -> FeatureConfig:
        return FeatureConfig(
            name="blog",
            templates_dir=self.root_dir / "templates",
            content_dir=self.root_dir / "content",
            styles_dir=self.root_dir / "styles",
            url_prefix="/posts"
        )
    
    def get_templates(self) -> List[str]:
        """Return templates that need to be rendered"""
        # We only return the list template here
        return ["posts.html"]
    
    def get_context(self) -> Dict[str, Any]:
        """Get context for template rendering"""
        posts = self.process_content()
        return {
            "posts": posts,
            "recent_posts": posts[:5]
        }
    
    def render_individual_posts(self, env: Environment, output_dir: Path, global_context: Dict[str, Any]):
        """Render individual post pages"""
        posts = self.process_content()
        template = env.get_template("post.html")
        
        posts_dir = output_dir / "posts"
        posts_dir.mkdir(parents=True, exist_ok=True)
        
        for post in posts:
            context = {
                **global_context,
                "post": post
            }
            
            output = template.render(**context)
            output_path = posts_dir / f"{post['slug']}.html"
            output_path.write_text(output, encoding='utf-8')
    
    def process_content(self) -> List[Dict[str, Any]]:
        """Process all blog posts"""
        posts = []
        posts_dir = self.get_config().content_dir / "posts"
        
        for md_file in posts_dir.glob("*.md"):
            with open(md_file, "r", encoding="utf-8") as f:
                content = f.read()
                
            # Extract metadata and convert content
            metadata, html = self._process_post(content)
            
            posts.append({
                "content": html,
                "title": metadata.get("title", [md_file.stem])[0],
                "date": metadata.get("date", [""])[0],
                "slug": md_file.stem,
                "excerpt": self._generate_excerpt(html),
                **{k: v[0] for k, v in metadata.items()}  # Add all metadata
            })
        
        # Sort posts by date, newest first
        return sorted(posts, key=lambda x: x["date"], reverse=True)
    
    def _process_post(self, content: str) -> tuple[Dict[str, List[str]], str]:
        """Process a single post's content and metadata"""
        import markdown
        md = markdown.Markdown(extensions=[
            "meta",
            "attr_list",
            "fenced_code",
            "tables"
        ])
        
        html = md.convert(content)
        metadata = getattr(md, "Meta", {})
        
        return metadata, html
    
    def _generate_excerpt(self, html: str, length: int = 200) -> str:
        """Generate a plain text excerpt from HTML content"""
        from bs4 import BeautifulSoup
        soup = BeautifulSoup(html, "html.parser")
        text = soup.get_text(" ", strip=True)
        return text[:length] + "..." if len(text) > length else text
    
    def pre_build(self) -> None:
        """Ensure output directories exist"""
        (self.output_dir / "posts").mkdir(parents=True, exist_ok=True)

    def post_build(self) -> None:
        """Render individual post pages after main build"""
        global_context = {
            "site": self.site_config,
            "nav": self.site_generator.nav_config
        }
        self.render_individual_posts(self.site_generator.env, self.output_dir, global_context)