import Map "mo:core/Map";
import Array "mo:core/Array";
import Text "mo:core/Text";
import Order "mo:core/Order";
import Iter "mo:core/Iter";
import Runtime "mo:core/Runtime";

actor {
  type Row = [Text];
  type Key = Text;

  module Record {
    public type Record = {
      key : Key;
      row : Row;
    };

    public func compare(left : Record, right : Record) : Order.Order {
      switch (Text.compare(left.key, right.key)) {
        case (#equal) { left.row.compare(right.row) };
        case (order) { order };
      };
    };
  };

  let records = Map.empty<Key, Record.Record>();

  public shared ({ caller }) func addRecord(key : Key, row : Row) : async () {
    if (records.containsKey(key)) {
      Runtime.trap("This key already exists.");
    };

    let record : Record.Record = {
      key;
      row;
    };

    records.add(key, record);
  };

  public query ({ caller }) func getRecord(key : Key) : async Record.Record {
    let record = records.get(key);
    switch (record) {
      case (null) { Runtime.trap("No entry with the provided ID exists in records.") };
      case (?record) { record };
    };
  };

  public query ({ caller }) func containsKey(key : Key) : async Bool {
    records.containsKey(key);
  };

  public query ({ caller }) func getAllRecords() : async [Record.Record] {
    records.values().toArray();
  };

  public query ({ caller }) func getSize() : async Nat {
    records.size();
  };
};
