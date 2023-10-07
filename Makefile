MONCI_IMAGE=meteotiles

.moncic-ci-bootstrap:
	monci image $(MONCI_IMAGE) extends fedora38
	monci image $(MONCI_IMAGE) install npm
	touch .moncic-ci-bootstrap

check: .moncic-ci-bootstrap
	monci run -W . $(MONCI_IMAGE) \
		bash -c \
		"npm install && \
		npm run compile && \
		npm test"

dist: .moncic-ci-bootstrap
	mkdir -p dist
	monci run -W . --bind $(CURDIR)/dist:/dist --user $(MONCI_IMAGE) bash -c "npm install && npm run build && cp dist/* /dist/"

clean:
	monci remove --purge $(MONCI_IMAGE)
	$(RM) .moncic-ci-bootstrap

.PHONY: check
