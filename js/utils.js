function deletePrefix(id, prefix){
	var strId = id.toString();
	return strId.substring(prefix.length, strId.length);
}