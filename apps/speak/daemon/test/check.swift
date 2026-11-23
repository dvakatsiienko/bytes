// one family of rows: prints each row whose answer is not the wanted one, then the count
func check<T: Equatable>(_ family: String, _ rows: [(name: String, got: T, want: T)]) -> Int {
    let failing = rows.filter { $0.got != $0.want }
    for row in failing { print("✗ \(family): \(row.name)\n  want \(row.want)\n  got  \(row.got)") }
    print("\(rows.count - failing.count)/\(rows.count) \(family) cases pass")
    return failing.count
}
