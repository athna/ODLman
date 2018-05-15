#!/usr/bin/perl
# 説明   : 共通のサブルーチン集。
# 作成者 : 江野高広
# 作成日 : 2016/07/25
# 更新   : 2016/09/09 XML に対応

use strict;
use warnings;

use JSON;
use URI::Escape;

use lib '/usr/local/ODLman/lib';
use Common_system;

package ODLman_common;



#
# URL を完成させる。
#
sub compleat_url {
 my $_url = $_[0];
 
 my $ODL_ip_address = &Common_system::ODL_ip_address();
 my $url = 'http://' . $ODL_ip_address . ':8181';
 
 if($_url =~ /^\//){
  $url .= $_url;
 }
 else{
  $url .= '/' . $_url;
 }
 
 return($url);
}

#
# URL, Method を取り出す。
#
sub get_url_method {
 my $access2db   = $_[0];
 my $restconf_id = $_[1];
 my $flag_delete = $_[2];
 
 my $select_column = 'vcRestconfUrl,iRestconfMethod';
 my $table = 'T_Restconf';
 my $condition = "where vcRestconfId ='" . $restconf_id . "'";
 $access2db -> set_select($select_column, $table, $condition);
 my $ref_Restconf = $access2db -> select_cols;

 if(scalar(@$ref_Restconf) == 0){
  return('', '');
 }
 
 my $url         = $ref_Restconf -> [0];
 my $method_code = $ref_Restconf -> [1];
 my $method = '';
 
 if(($method_code eq '0') || (defined($flag_delete) && (($flag_delete eq '1') || ($flag_delete == 1)))){
  $method = 'DELETE';
 }
 elsif($method_code eq '2'){
  $method = 'PUT';
 }
 elsif($method_code eq '3'){
  $method = 'POST';
 }
 else{
  $method = 'GET';
 }
 
 return($url, $method);
}


#
# JSON を取り出す。
#
sub get_json {
 my $access2db   = $_[0];
 my $restconf_id = $_[1];
 
 my $select_column = 'iJsonRepeatType,txJsonText';
 my $table = 'T_Json';
 my $condition = "where vcRestconfId ='" . $restconf_id . "' order by iJsonIndex";
 $access2db -> set_select($select_column, $table, $condition);
 my $ref_Json = $access2db -> select_array_cols;
 
 my @json_list = ();
 
 foreach my $ref_row (@$ref_Json){
  my $repeat = $ref_row -> [0];
  my $json   = $ref_row -> [1];
  $repeat += 0;
  $json =~ s/^\n+//;
  $json =~ s/\n+$//;
  
  push(@json_list, {'repeat' => $repeat, 'json' => $json});
 }
 
 return(\@json_list);
}



#
# 値が繰り返し用のものかどうかのリストを作る。
#
sub get_value_repeat_type {
 my $access2db   = $_[0];
 my $restconf_id = $_[1];
 
 my $select_column = 'vcInputKey,vcGroupId';
 my $table = 'T_Input';
 my $condition = "where vcRestconfId ='" . $restconf_id . "'";
 $access2db -> set_select($select_column, $table, $condition);
 my $ref_Input = $access2db -> select_array_cols;
 
 my %value_repeat_type = ();
 
 foreach my $ref_row (@$ref_Input){
  my $key      = $ref_row -> [0];
  my $group_id = $ref_row -> [1];
  
  if($group_id eq 'default'){
   $value_repeat_type{$key} = 0;
  }
  else{
   $value_repeat_type{$key} = 1;
  }
 }
 
 return(\%value_repeat_type);
}



#
# JSON を完成させる。
#
sub make_json {
 my $ref_json_list              = $_[0];
 my $ref_value_repeat_type_list = $_[1];
 my $ref_value_list             = $_[2];
 my $flag_xml = 0;
 
 if(defined($ref_json_list -> [0])){
  $flag_xml = &ODLman_common::check_xml($ref_json_list -> [0] -> {'json'});
 }
 
 my @compleat_json_list = ();
 foreach my $ref_row (@$ref_json_list){
  my $repeat = $ref_row -> {'repeat'};
  my $json   = $ref_row -> {'json'};
  
  my $compleat_json = '';
  my $unknown_key = '';
  
  if($repeat == 0){
   ($compleat_json, $unknown_key) = &ODLman_common::insert_skeleton($json, 0, $ref_value_repeat_type_list, $ref_value_list, 0);
   
   unless(defined($compleat_json)){
    return(undef, $unknown_key, $flag_xml);
   }
  }
  elsif($repeat == 1){
   my @compleat_repeat_json_list = ();
   my $n = 0;
   
   while(1){
    my $compleat_repeat_json = '';
    ($compleat_repeat_json, $unknown_key) = &ODLman_common::insert_skeleton($json, $n, $ref_value_repeat_type_list, $ref_value_list, 0);
    
    unless(defined($compleat_repeat_json)){
     return(undef, $unknown_key, $flag_xml);
    }
    elsif(length($compleat_repeat_json) == 0){
     last;
    }
    
    if($flag_xml == 0){
     push(@compleat_repeat_json_list, &ODLman_common::trim_canma($compleat_repeat_json));
    }
    elsif($flag_xml == 1){
     push(@compleat_repeat_json_list, $compleat_repeat_json);
    }
    
    $n ++;
   }
   
   if($flag_xml == 0){
    $compleat_json = &ODLman_common::join_json(@compleat_repeat_json_list);
   }
   elsif($flag_xml == 1){
    $compleat_json = join("\n", @compleat_repeat_json_list);
   }
  }
  
  if($flag_xml == 0){  
   push(@compleat_json_list, &ODLman_common::trim_canma($compleat_json));
  }
  elsif($flag_xml == 1){
   push(@compleat_json_list, $compleat_json);
  }
 }
 
 if($flag_xml == 0){
  my $compleat_json = &ODLman_common::join_json(@compleat_json_list);
  return($compleat_json, '', 0);
 }
 elsif($flag_xml == 1){
  my $compleat_xml = join("\n", @compleat_json_list);
  return($compleat_xml, '', 1);
 }
}



#
# 前後からカンマを取り除く
#
sub trim_canma {
 my $string = $_[0];
 
 my @split_string = split(//, $string);
 my $length_string = scalar(@split_string);
 
 for(my $i = 0; $i < $length_string; $i ++){
  if($split_string[$i] =~ /[^\s,]/){
   last;
  }
  elsif($split_string[$i] eq ','){
   $split_string[$i] = '';
  }
 }
 
 for(my $i = $length_string - 1; $i >= 0; $i --){
  if($split_string[$i] =~ /[^\s,]/){
   last;
  }
  elsif($split_string[$i] eq ','){
   $split_string[$i] = '';
  }
 }
 
 my $trimed_string = join('', @split_string);
 
 return($trimed_string);
}



#
# カンマの必要、不必要に配慮してJSON をつなぐ。
#
sub join_json {
 my @json_list = @_;
 my $json = '';
 
 my $json_number = scalar(@json_list);
 
 for(my $i = $json_number - 1; $i >= 0; $i --){
  if(length($json_list[$i]) == 0){
   splice(@json_list, $i, 1);
  }
 }
 
 $json_number = scalar(@json_list);
 
 if($json_number == 0){
  return('');
 }
 
 for(my $i = 0; $i < $json_number - 1; $i ++){
  my @split_json = split(//, $json_list[$i]);
  
  my $flag_canma = 1;
  my $length_json = scalar(@split_json);
  
  for(my $i = $length_json - 1; $i >= 0; $i --){
   if($split_json[$i] =~ /\s/){
    next;
   }
   elsif(($split_json[$i] eq '{') || ($split_json[$i] eq '[')){
    $flag_canma = 0;
    last;
   }
   else{
    last;
   }
  }
  
  if($flag_canma == 1){
   my @split_next_json = split(//, $json_list[$i + 1]); 
   
   foreach my $char (@split_next_json){
    if($char =~ /\s/){
     next;
    }
    elsif(($char eq '}') || ($char eq ']')){
     $flag_canma = 0;
     last;
    }
    else{
     last;
    }
   }
  }
  
  if($flag_canma == 1){
   $json .= $json_list[$i] . ",\n";
  }
  else{
   $json .= $json_list[$i] . "\n";
  }
 }
 
 $json .= $json_list[$json_number - 1];
 
 return($json);
}



#
# スケルトンを埋める。
#
sub insert_skeleton {
 my $string          = $_[0];
 my $value_index     = $_[1];
 my $ref_value_repeat_type_list = $_[2];
 my $ref_value_list  = $_[3];
 my $flag_uri_escape = $_[4];
 my $replaced_string = '';
 
 unless(defined($string) && (length($string) > 0)){
  return('', '');
 }
 
 unless(defined($flag_uri_escape) && (length($flag_uri_escape) > 0)){
  $flag_uri_escape = 0;
 }
 
 my @string_list = split(//, $string);
 my @stack = ();
 
 my $flag_escape = 0;
 my $flag_sharp  = 0;
 my $count_sharp = 0;
 foreach my $character (@string_list){
  if(($flag_escape == 0) && ($character eq "\\")){
   $flag_escape = 1;
   next;
  }
  
  if($flag_escape == 1){
   push(@stack, $character);
   $flag_escape = 0;
   next;
  }
  
  if($character eq '#'){
   $count_sharp ++;
   
   if(($flag_sharp == 0) && ($count_sharp == 3)){
    $flag_sharp = 1;
   }
   elsif(($flag_sharp == 1) && ($count_sharp == 3)){
    $flag_sharp = 2;
   }
  }
  else{
   $count_sharp = 0;
  }
  
  if($flag_sharp == 2){
   $flag_sharp  = 0;
   $count_sharp = 0;
   
   splice(@stack, -2);
   
   my $poped_character = '';
   my $key = '';
   while($poped_character ne '#'){
    $key = $poped_character . $key;
    $poped_character = pop(@stack);
   }
   
   splice(@stack, -2);
   
   my $value = '';
   
   if(defined($ref_value_repeat_type_list -> {$key})){
    my $repeat_type = $ref_value_repeat_type_list -> {$key};
    
    if($repeat_type == 0){
     if(defined($ref_value_list -> {$key})){
      if(defined($ref_value_list -> {$key} -> [0])){
       $value = $ref_value_list -> {$key} -> [0];
      }
      else{
       return('', '');
      }
     }
     else{
      return(undef, $key);
     }
    }
    else{
     if(defined($ref_value_list -> {$key})){
      if(defined($ref_value_list -> {$key} -> [$value_index])){
       $value = $ref_value_list -> {$key} -> [$value_index];
      }
      else{
       return('', '');
      }
     }
     else{
      return(undef, $key);
     }
    }
   }
   else{
    return(undef, $key);
   }
   
   if($flag_uri_escape == 1){
    $value = &URI::Escape::uri_escape($value);
   }
   
   push(@stack, $value);
  }
  else{
   push(@stack, $character);
  }
 }
 
 $replaced_string = join('', @stack);
 
 return($replaced_string, '');
}



#
# エラー結果を作成する。
#
sub make_error_result {
 my $reason = $_[0];
 
 my %results = (
  'result' => 0,
  'reason' => $reason
 );
 
 my $json_results = &JSON::to_json(\%results);
 
 return($json_results);
}



#
# JSON から中の要素と外枠のkey を取り出す。
#
sub parse_json {
 my $json = $_[0];
 
 my $ref = undef;
 eval{$ref = &JSON::from_json($json);};
 
 if(length($@) > 0){
  return('', undef);
 }
 
 my ($key, $ref_data) = each(%$ref);
 
 return($key, $ref_data -> [0]);
}



#
# ODL へのアクセス結果をテキストにする。
#
sub make_text_summary {
 my $ref_summary = $_[0];
 my $method    = $ref_summary -> {'method'};
 my $url       = $ref_summary -> {'url'};
 my $send_body = $ref_summary -> {'send_body'};
 
 my $text_summary = '[Method]' . "\n" . $method . "\n\n" . '[URL]' . "\n" . $url . "\n\n";
 
 if(exists($ref_summary -> {'send_body'})){
  $text_summary .= '[Send]' . "\n" . $send_body . "\n\n" 
 }
 
 if(exists($ref_summary -> {'response_body'})){
  $text_summary .= '[Response]' . "\n" . $ref_summary -> {'response_body'} . "\n";
 }
 elsif(exists($ref_summary -> {'error'})){
  $text_summary .= '[Error]' . "\n" . $ref_summary -> {'error'} . "\n";
 }
 
 $text_summary .= '----------------------------------------------------------------------' . "\n\n";
}



#
# XML かどうか確認する。
#
sub check_xml {
 my $string = $_[0];
 my $flag_xml = 0;
 
 my @split_string = split(//, $string);
 
 foreach my $char (@split_string){
  if($char =~ /\s/){
   next;
  }
  elsif($char eq '<'){
   $flag_xml = 1;
   last;
  }
  else{
   last;
  }
 }
 
 return($flag_xml);
}


1;
