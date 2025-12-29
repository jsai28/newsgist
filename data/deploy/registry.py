from prefect import flow

class Registry:
  def __init__(self):
    self.deployments = []

  def __call__(self, cron: str):
    def inner(fn: flow):
      self.deployments.append({
        "flow": fn,
        "cron": cron
      })
      return fn

    return inner

registry = Registry()
