import cowsay

def announce_news(message: str):
  return cowsay.get_output_string('cow', message)
