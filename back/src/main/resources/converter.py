def convert_key_to_properties_format(file_path):
    with open(file_path, 'r') as f:
        key = f.read()
    key = key.replace('\n', '\\n')
    key = key.replace(' ', '')
    return key

private_key_path = 'private_key.pem'
public_key_path = 'public_key.pem'

private_key = convert_key_to_properties_format(private_key_path)
public_key = convert_key_to_properties_format(public_key_path)

print(f"jwt.private.key={private_key}")
print(f"jwt.public.key={public_key}")
