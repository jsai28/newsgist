import hashlib
import subprocess
import pathlib
from prefect.docker import DockerImage
from .registry import registry
from . import constants as C


def deploy(env: str):
  if env == "local":
    for deployment in registry.deployments:
      flow, cron = deployment["flow"], deployment["cron"]
      flow.deploy(
        name=f"{flow.name}-deployment",
        work_pool_name=C.LOCAL_WORK_POOL,
        image=DockerImage(
            name=f"newsgest/{flow.name}",
            tag="latest",
            dockerfile="deploy/images/Dockerfile",
            buildargs={"FLOW_NAME": flow.name}
        ),
        push=False,
        cron=cron,
        job_variables={
          "env": {
            "PREFECT_API_URL": "http://host.docker.internal:4200/api",
            "PYTHONPATH": "/app",
          },
          "auto_remove": True,
          "image_pull_policy": "IfNotPresent",
        }
      )
  elif env == "prod":
    raise ValueError("Prod not yet supported.")
