IMAGEDIR=.moncic-ci
IMAGENAME=meteotiles

bootstrap: $(IMAGEDIR)/.bootstrap-state

$(IMAGEDIR)/.bootstrap-state: $(IMAGEDIR)/$(IMAGENAME).yaml
	monci bootstrap -I $(IMAGEDIR) --recreate $(IMAGENAME)
	touch $@

remove-image:
	monci remove -I $(IMAGEDIR) $(IMAGENAME)
	$(RM) $(IMAGEDIR)/.bootstrap-state

check: $(IMAGEDIR)/.bootstrap-state
	monci run -I $(IMAGEDIR) -W . $(IMAGENAME) bash -c "npm install && npm run compile && npm test"

dist: $(IMAGEDIR)/.bootstrap-state
	mkdir -p dist
	monci run -I $(IMAGEDIR) -W . --bind $(CURDIR)/dist:/dist --user $(IMAGENAME) bash -c "npm install && npm run build && cp dist/* /dist/"

.PHONY: bootstrap provision-development check dist
