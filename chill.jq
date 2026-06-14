def older_than_days($days):
  (sub("\\.[0-9]+Z$"; "Z") | fromdateiso8601) < (now - ($days * 86400));

.[]
| select(.version | startswith($prefix))
| select(.visibility)
| select(.yanked_at == null)
| select(.published_at | older_than_days($chill_days))


