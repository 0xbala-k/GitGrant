from typing import List, Dict, Tuple

def split_dicts(dict_list: List[Dict[int, int]]) -> Tuple[List[str], List[str]]:
    keys = []
    values = []
    for d in dict_list:
        # Each dictionary is assumed to have a single key/value pair.
        # Using next(iter(...)) extracts the first (and only) pair.
        key, value = next(iter(d.items()))
        keys.append(str(key))
        values.append(str(value))
    return keys, values