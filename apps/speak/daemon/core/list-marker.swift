// where a selection ends, as accessibility tells it, and the list marker right before that end
import Foundation

protocol SelectionPlaces {
    associatedtype Place
    // one made backwards answers its ends backwards; none where an app keeps no places
    func ends() -> (Place, Place)?
    func later(_ one: Place, _ other: Place) -> Place?
    func before(_ place: Place) -> Place?
    func element(at place: Place) -> (role: String?, value: String?)?
}

func markerBeforeEnd(of selection: some SelectionPlaces) -> String? {
    guard let (one, other) = selection.ends(), let end = selection.later(one, other), let before = selection.before(end),
          let touched = selection.element(at: before), touched.role == "AXListMarker" else { return nil }
    return touched.value
}
