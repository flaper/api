#Development Guide

## Model update
* `model.save` - "direct save", will skip ignoreProperties, setCurrentUser etc
* `model.updateAttributes` - will call all observers
