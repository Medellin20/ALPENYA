-- Extension non destructive du catalogue existant.
alter type public.property_type add value if not exists 'unfurnished_apartment';
alter type public.property_type add value if not exists 'mobile_home';
