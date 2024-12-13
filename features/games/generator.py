from pathlib import Path
from typing import Dict, Any, List
import yaml
from core.base import DataFeature, FeatureConfig

class GamesFeature(DataFeature):  
    def get_config(self) -> FeatureConfig:
        return FeatureConfig(
            name="games",
            templates_dir=self.root_dir / "templates",
            content_dir=self.root_dir / "content",
            styles_dir=self.root_dir / "styles",
            url_prefix=""
        )
   
    def load_data(self) -> Dict[str, Any]:
        """Load games data from YAML file"""
        games_data_path = self.root_dir / "content" / "games.yaml"
        if games_data_path.exists():
            with open(games_data_path, 'r', encoding='utf-8') as f:
                data = yaml.safe_load(f)
                return data if data else []
        return []

    def pre_build(self) -> None:
        """Ensure output directories exist"""
        (self.output_dir / "games").mkdir(parents=True, exist_ok=True)