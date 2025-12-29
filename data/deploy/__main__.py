import sys
import importlib
import pathlib
from .deploy import deploy

flows_dir = pathlib.Path(__file__).parent.parent / "flows"
for flow_module in flows_dir.glob("*/"):
  if flow_module.is_dir() and (flow_module / f"{flow_module.name}.py").exists():
    try:
      importlib.import_module(f"flows.{flow_module.name}.{flow_module.name}")
    except ImportError as e:
      print(f"Warning: Could not import {flow_module.name}: {e}")

if __name__ == "__main__":
  target_env = sys.argv[1]
  deploy(target_env)
  print(f"Deployed flows to {target_env}")
