from pathlib import Path
from typing import Dict, Any, List
from core.base import MediaFeature, FeatureConfig

class GalleryFeature(MediaFeature):
    def get_config(self) -> FeatureConfig:
        return FeatureConfig(
            name="gallery",
            templates_dir=self.root_dir / "templates",
            content_dir=self.root_dir / "content",
            styles_dir=self.root_dir / "styles",
            url_prefix="/gallery"
        )
    
    def get_context(self) -> Dict[str, Any]:
        """Get context for template rendering"""
        return {
            "galleries": self.get_media_files()
        }
    
    def get_media_files(self) -> Dict[str, List[str]]:
        """Get all media files organized by type"""
        media_types = {
            'images': ['.jpg', '.jpeg', '.png', '.gif'],
            'videos': ['.mp4', '.webm'],
            'music': ['.mp3', '.wav']
        }
        
        galleries = {}
        content_dir = self.get_config().content_dir
        
        for media_type, extensions in media_types.items():
            media_dir = content_dir / media_type
            if media_dir.exists():
                galleries[media_type] = [
                    str(f.relative_to(content_dir))
                    for f in media_dir.glob('**/*')
                    if f.suffix.lower() in extensions
                ]
        
        return galleries
    
    def get_static_files(self) -> List[Path]:
        """Get all media files that need to be copied to output"""
        static_files = []
        content_dir = self.get_config().content_dir
        
        if content_dir.exists():
            for file_path in content_dir.glob('**/*'):
                if file_path.is_file():
                    static_files.append(file_path)
        
        return static_files
    
    def pre_build(self) -> None:
        """Ensure output directories exist"""
        for media_type in ['images', 'videos', 'music']:
            (self.output_dir / media_type).mkdir(parents=True, exist_ok=True)