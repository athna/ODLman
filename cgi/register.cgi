#!/usr/bin/perl
# 説明   : Restconf 枠の登録。
# 作成者 : 江野高広
# 作成日 : 2016/06/13

use strict;
use warnings;

use CGI;
use JSON;

use lib '/usr/local/ODLman/lib';
use Common_sub;
use Common_system;
use Access2DB;

my $time = time;



#
# DB アクセスのためのオブジェクトを作成する。
#
my ($DB_name, $DB_host, $DB_user, $DB_password) = &Common_system::DB_connect_parameter();
my @DB_connect_parameter_list                   = ('dbi:mysql:' . $DB_name . ':' . $DB_host, $DB_user, $DB_password);
my $access2db                                   = Access2DB -> open(@DB_connect_parameter_list);



#
# Restconf ID の確認。
#
my $cgi = new CGI;
my $restconf_id = $cgi -> param('restconf_id');
my $manual_restconf_id = $cgi -> param('manual_restconf_id');
my $insert_update = '';

unless(defined($restconf_id) && (length($restconf_id) > 0)){
 $insert_update = 'insert';
 
 unless(defined($manual_restconf_id) && (length($manual_restconf_id) > 0)){
  $restconf_id = &Common_sub::make_random_string(16);
  
  my $select_column = 'vcRestconfId,vcRestconfId';
  my $table = 'T_Restconf';
  my $condition = '';
  $access2db -> set_select($select_column, $table, $condition);
  my $ref_restconf_id_list = $access2db -> select_hash_col2;
  
  while(1){
   if(!exists($ref_restconf_id_list -> {$restconf_id})){
    last;
   }
   else{
    $restconf_id = &Common_sub::make_random_string(16);
   }
  }
 }
 else{
  my $escaped_manual_restconf_id = &Common_sub::escape_sql($manual_restconf_id);
  
  if($escaped_manual_restconf_id eq $manual_restconf_id){
   my $select_column = 'count(*)';
   my $table = 'T_Restconf';
   my $condition = "where vcRestconfId = '" . $manual_restconf_id . "'";
   $access2db -> set_select($select_column, $table, $condition);
   my $count = $access2db -> select_col1;
   
   if($count == 0){
    $restconf_id = $manual_restconf_id
   }
   else{
    print "Content-type: text/plain; charset=UTF-8\n\n";
    print '{"result"=>0,"reason"=>"そのID は既に使われています。"}';
    exit(0);
   }
  }
  else{
   print "Content-type: text/plain; charset=UTF-8\n\n";
   print '{"result"=>0,"reason"=>"ID に使えない文字が含まれています。"}';
   exit(0);
  }
 }
}
elsif(length($restconf_id) > 0){
 $insert_update = 'update';
}




#
# 各値を受け取る。
#
my $restconf_title       = $cgi -> param('restconf_title');
my $restconf_url         = $cgi -> param('restconf_url');
my $restconf_method      = $cgi -> param('restconf_method');
my $text_json_sort_list  = $cgi -> param('text_json_sort_list');
my $text_json_list       = $cgi -> param('text_json_list');
my $text_group_list      = $cgi -> param('text_group_list');
my $text_input_sort_list = $cgi -> param('text_input_sort_list');
my $text_input_list      = $cgi -> param('text_input_list');

$restconf_title = &Common_sub::escape_sql($restconf_title);
$restconf_url   = &Common_sub::escape_sql($restconf_url);
my $ref_json_sort_list  = &JSON::from_json($text_json_sort_list);
my $ref_json_list       = &JSON::from_json($text_json_list);
my $ref_group_list      = &JSON::from_json($text_group_list);
my $ref_input_sort_list = &JSON::from_json($text_input_sort_list);
my $ref_input_list      = &JSON::from_json($text_input_list);



#
# insert or update
# update の場合、T_Json, T_Group, T_Input はdelete, insert を行う。
#
if($insert_update eq 'insert'){
 my $select_column = 'max(iRestconfIndex)';
 my $table = 'T_Restconf';
 my $condition = '';
 $access2db -> set_select($select_column, $table, $condition);
 my $max_index = $access2db -> select_col1;
 
 my $index = 1;
 if(defined($max_index)){
  $index = $max_index + 1;
 }
 
 my $insert_column = 'vcRestconfId,iRestconfIndex,vcRestconfTitle,vcRestconfUrl,iRestconfMethod,iUpdateTime,iCreateTime';
 my @restconf_values = ("('" . $restconf_id . "'," . $index . ",'" . $restconf_title . "','" . $restconf_url . "'," . $restconf_method . "," . $time . "," . $time . ")");
 $table = 'T_Restconf';
 $access2db -> set_insert($insert_column, \@restconf_values, $table);
 $access2db -> insert_exe;
}
elsif($insert_update eq 'update'){
 my @set = (
  "vcRestconfTitle = '" . $restconf_title . "'",
    "vcRestconfUrl = '" . $restconf_url . "'",
  'iRestconfMethod = '  . $restconf_method,
      'iUpdateTime = '  . $time
 );
 
 my $table = 'T_Restconf';
 my $condition = "where vcRestconfId = '" . $restconf_id . "'";
 $access2db -> set_update(\@set, $table, $condition);
 my $count = $access2db -> update_exe;
 
 $access2db -> set_delete('T_Json', $condition);
 $access2db -> delete_exe;
 
 $access2db -> set_delete('T_Group');
 $access2db -> delete_exe;
 
 $access2db -> set_delete('T_Input');
 $access2db -> delete_exe;
}



#
# insert する値の入れ物。
#
my @json_values  = ();
my @group_values = ();
my @input_values = ();



#
# T_Json の値を取り出し。
# 
my $J = scalar(@$ref_json_sort_list);

$restconf_method += 0;
if(($restconf_method == 2) || ($restconf_method == 3)){
 for(my $json_index = 0; $json_index < $J; $json_index ++){ 
  my $json_id = $ref_json_sort_list -> [$json_index];
  my $json_repeat_type = $ref_json_list -> {$json_id} -> {'repeat'};
  my $json_text        = $ref_json_list -> {$json_id} -> {'text'};
  
  if(defined($json_text)){
   my $json_text = &Common_sub::escape_sql($json_text);
   push(@json_values, "('" . $restconf_id . "'," . $json_index . ",'" . $json_id . "'," . $json_repeat_type . ",'" . &Common_sub::escape_sql($json_text) . "'," . $time . "," . $time . ")");
  }
 }
}



#
# T_Group, T_Input の値を取り出し。
#
my $G = scalar(@$ref_group_list);

for(my $group_index = 0; $group_index < $G; $group_index ++){
 my $group_id = $ref_group_list -> [$group_index]; 
 
 my $V = scalar(@{$ref_input_sort_list -> {$group_id}});
 
 if($V > 0){
  push(@group_values, "('" . $restconf_id . "'," . $group_index . ",'" . $group_id . "'," . $time . "," . $time . ")");
  
  for(my $input_index = 0; $input_index < $V; $input_index ++){
   my $input_id = $ref_input_sort_list -> {$group_id} -> [$input_index];
   my $key    = &Common_sub::escape_sql($ref_input_list -> {$input_id} -> {'key'});
   my $name   = &Common_sub::escape_sql($ref_input_list -> {$input_id} -> {'name'});
   my $type   = $ref_input_list -> {$input_id} -> {'type'};
   my $option = $ref_input_list -> {$input_id} -> {'option'};
   
   my $json_option = &main::input_option($type, $option);
   
   if(defined($key) && defined($name) && defined($json_option) && (length($key) > 0) && (length($name) > 0)){
    $json_option = &Common_sub::escape_sql($json_option);
    push(@input_values, "('" . $restconf_id . "','" . $group_id . "'," . $input_index . ",'" . $input_id . "','" . $key . "','" . $name . "','" . $type . "','" . $json_option . "'," . $time . "," . $time . ")");
   }
  }
 }
}



#
# T_Json, T_Group, T_Input のinsert
#
if(scalar(@json_values) > 0){
 my $insert_column = 'vcRestconfId,iJsonIndex,vcJsonId,iJsonRepeatType,txJsonText,iUpdateTime,iCreateTime';
 my $table = 'T_Json';
 $access2db -> set_insert($insert_column, \@json_values, $table);
 $access2db -> insert_exe;
}

if(scalar(@group_values) > 0){
 my $insert_column = 'vcRestconfId,iGroupIndex,vcGroupId,iUpdateTime,iCreateTime';
 my $table = 'T_Group';
 $access2db -> set_insert($insert_column, \@group_values, $table);
 $access2db -> insert_exe;
}

if(scalar(@input_values) > 0){
 my $insert_column = 'vcRestconfId,vcGroupId,iInputIndex,vcInputId,vcInputKey,vcInputName,iInputType,vcInputOption,iUpdateTime,iCreateTime';
 my $table = 'T_Input';
 $access2db -> set_insert($insert_column, \@input_values, $table);
 $access2db -> insert_exe;
}



$access2db -> close;



my %results = (
 'result' => 1,
 'insert_update'   => $insert_update,
 'restconf_id'     => $restconf_id,
 'restconf_title'  => $restconf_title,
 'restconf_method' => $restconf_method
);

my $ref_results = &JSON::to_json(\%results);

print "Content-type: text/plain; charset=UTF-8\n\n";
print $ref_results;




sub input_option {
 my $type   = $_[0];
 my $option = $_[1];
 
 if(($type == 1) || ($type == 2)){
  unless(defined($option) && (length($option) > 0)){
   $option = '30';
  }
  elsif($option !~ /^[0-9]+$/){
   $option = '30';
  }
  elsif($option =~ /^0+$/){
   $option = '30';
  }
  elsif($option > 60){
   $option = '60';
  }
  
  return($option);
 }
 elsif($type == 3){
  unless(defined($option) && (length($option) > 0)){
   return(undef);
  }
  else{
   my $pos = index($option, "\n");
   if($pos > 0){
    $option = substr($option, $pos);
   }
   
   my @split_option = split(/,/, $option);
   
   unless(scalar(@split_option) == 2){
    return(undef);
   }
   
   my $json_option = &JSON::to_json(\@split_option);
   
   return($json_option);
  }
 }
 elsif(($type == 4) || ($type == 5)){
  my @option_list = ();
  
  my @split_option = split(/\n/, $option);
  foreach my $option_line (@split_option){
   my @split_option_line = split(/,/, $option_line);
   
   if(scalar(@split_option_line) == 2){
    push(@option_list, \@split_option_line);
   }
  }
  
  unless(scalar(@option_list) > 0){
   return(undef);
  }
  
  my $json_option_list = &JSON::to_json(\@option_list);
  
  return($json_option_list);
 }
}
