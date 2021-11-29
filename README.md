# csml-action

Action to upload CSML code into the server engine.
## Inputs

## `api-key`

**Required** The api key from csml server.
## `api-secret`

**Required** The api secret from csml server.
## `endpoint`

**Required** The endpoint where csml is hosted.
## `csml-folder-path`

**Required** The path in your repo where the folder with csml code exists.

## Example usage

```yaml
uses: chatclass/csml-action@v1.1
with:
  api-key: 'xxxxxxxxx'
  api-secret: 'xxxxxxxxx'
  endpoint: 'https://clients.csml.dev/v1/api'
  csml-folder-path: '.'
```