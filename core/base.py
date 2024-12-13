from abc import ABC, abstractmethod
from dataclasses import dataclass
from pathlib import Path
from typing import Dict, Any, List, Optional

@dataclass
class NavItem:
    title: str
    url: str

@dataclass
class NavConfig:
    main_nav: List[NavItem]
    footer_nav: List[NavItem]

    @classmethod
    def from_dict(cls, data: Dict) -> 'NavConfig':
        main_nav = [NavItem(**item) for item in data['main_nav']]
        footer_nav = [NavItem(**item) for item in data['footer_nav']]
        return cls(main_nav=main_nav, footer_nav=footer_nav)


@dataclass
class SocialConfig:
    twitter: str
    github: str

@dataclass
class HeroConfig:
    title: str
    subtitle: str

@dataclass
class PageConfig:
    hero: HeroConfig

@dataclass
class PagesConfig:
    home: PageConfig
    gallery: Optional[PageConfig] = None
    posts: Optional[PageConfig] = None

@dataclass
class SiteConfig:
    title: str
    description: str
    author: str
    social: SocialConfig
    pages: PagesConfig

    @classmethod
    def from_dict(cls, data: Dict) -> 'SiteConfig':
        social = SocialConfig(**data['social'])
        pages_data = data['pages']
        
        # Convert hero configs
        for page_name, page_data in pages_data.items():
            if 'hero' in page_data:
                pages_data[page_name]['hero'] = HeroConfig(**page_data['hero'])
        
        pages = PagesConfig(**pages_data)
        
        return cls(
            title=data['title'],
            description=data['description'],
            author=data['author'],
            social=social,
            pages=pages
        )

@dataclass
class FeatureConfig:
    """Configuration for a feature"""
    name: str                    # Feature name (e.g., 'blog', 'gallery')
    templates_dir: Path          # Path to feature's templates
    content_dir: Optional[Path]  # Path to feature's content (optional)
    styles_dir: Optional[Path]   # Path to feature's styles (optional)
    url_prefix: str = ''         # URL prefix for this feature (e.g., '/blog')

class Feature(ABC):
    """Base class for all features"""
    
    def __init__(self, root_dir: Path, site_config: Dict[str, Any], output_dir: Path, site_generator):
        """
        Initialize a feature
        
        Args:
            root_dir: Root directory of the feature
            site_config: Global site configuration
            output_dir: Output directory for the built site
            site_generator: Reference to the main generator
        """
        self.root_dir = root_dir
        self.site_config = site_config
        self.output_dir = output_dir
        self.site_generator = site_generator
    
    @abstractmethod
    def get_config(self) -> FeatureConfig:
        """Return the feature's configuration"""
        pass
    
    @abstractmethod
    def get_context(self) -> Dict[str, Any]:
        """Return the context needed to render this feature's templates"""
        pass
    
    def get_templates(self) -> List[str]:
        """
        Return list of templates that need to be rendered.
        Override if feature needs multiple templates rendered.
        """
        return [f"{self.get_config().name}.html"]
    
    def pre_build(self) -> None:
        """Hook called before building - override if needed"""
        pass
    
    def post_build(self) -> None:
        """Hook called after building - override if needed"""
        pass
    
    def get_static_files(self) -> List[Path]:
        """
        Return list of static files that should be copied to output.
        Override if feature has static files.
        """
        return []

class ContentFeature(Feature):
    """Base class for features that have their own content files"""
    
    @abstractmethod
    def process_content(self) -> Any:
        """Process the feature's content files"""
        pass

class DataFeature(Feature):
    """Base class for features that load data from YAML/JSON files"""
    
    def get_context(self) -> Dict[str, Any]:
        """Default implementation for data features"""
        return {
            self.get_config().name: self.load_data()
        }
    
    @abstractmethod
    def load_data(self) -> Dict[str, Any]:
        """Must be implemented by children"""
        pass

class MarkdownFeature(ContentFeature):
    """Base class for features that process markdown files"""
    
    def process_markdown(self, content: str) -> str:
        """Process markdown content - can be overridden if needed"""
        import markdown
        md = markdown.Markdown(extensions=[
            'meta',
            'attr_list',
            'fenced_code',
            'tables'
        ])
        return md.convert(content)

class MediaFeature(Feature):
    """Base class for features that handle media files"""
    
    def get_media_files(self) -> Dict[str, List[Path]]:
        """Return dictionary of media files by type"""
        return {}
    
    def process_media(self, file: Path) -> None:
        """Process a media file - override if needed"""
        pass